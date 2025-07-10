import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import { config } from '../config'
import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'

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
      // Try simple format first (access_token, refresh_token)
      const simpleAccessMatch = cookieHeader.match(/access_token=([^;]+)/)
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
      throw new AppError('Missing authentication tokens', 401)
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
      logger.warn('Authentication failed:', { error: error?.message, userId: user?.id })
      throw new AppError('Invalid authentication', 401)
    }

    req.user = user
    req.supabase = supabase
    next()
  } catch (error) {
    next(error)
  }
}
