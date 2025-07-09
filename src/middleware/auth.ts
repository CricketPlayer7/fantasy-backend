import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

declare global {
  namespace Express {
    interface Request {
      user?: any
      supabase?: any
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let accessToken = null
    let refreshToken = null

    const cookieHeader = req.headers.cookie
    
    if (cookieHeader) {
      // Try simple format first (auth_token, refresh_token)
      const simpleAccessMatch = cookieHeader.match(/auth_token=([^;]+)/)
      const simpleRefreshMatch = cookieHeader.match(/refresh_token=([^;]+)/)

      if (simpleAccessMatch && simpleRefreshMatch) {
        accessToken = decodeURIComponent(simpleAccessMatch[1])
        refreshToken = decodeURIComponent(simpleRefreshMatch[1])
      } else {
        // Try Supabase format (sb-xxx-auth-token.0, sb-xxx-auth-token.1)
        const cookiePattern = /sb-[^-]+-auth-token\.(\d)=([^;]+)/g
        const cookieParts: { [key: string]: string } = {}
        let match
        
        while ((match = cookiePattern.exec(cookieHeader)) !== null) {
          cookieParts[match[1]] = match[2]
        }

        if (cookieParts['0'] && cookieParts['1']) {
          const decodedPart1 = decodeURIComponent(cookieParts['0'])
          const decodedPart2 = decodeURIComponent(cookieParts['1'])
          
          const base64Part1 = decodedPart1.replace('base64-', '')
          const base64Part2 = decodedPart2
          
          const combinedBase64 = base64Part1 + base64Part2
          const jsonString = Buffer.from(combinedBase64, 'base64').toString()
          const tokenData = JSON.parse(jsonString)
          
          accessToken = tokenData.access_token
          refreshToken = tokenData.refresh_token
        }
      }
    }

    if (!accessToken || !refreshToken) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    req.user = user
    req.supabase = supabase
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
