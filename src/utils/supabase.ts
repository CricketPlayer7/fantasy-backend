import { createClient } from '@supabase/supabase-js'
import { Request } from 'express'
import { config } from '../config'

interface AuthTokens {
  access_token: string
  refresh_token: string
}

export const createSupabaseClient = ({
  access_token,
  refresh_token,
}: AuthTokens) => {
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

  // Inject the session manually if needed
  if (refresh_token) {
    supabase.auth.setSession({
      access_token,
      refresh_token,
    })
  }

  return supabase
}

export const createSupabaseServerClient = (req: Request) => {
  // Extract access_token and refresh_token from cookies
  const access_token = req.cookies.access_token
  const refresh_token = req.cookies.refresh_token

  if (!access_token || !refresh_token) {
    throw new Error('Missing authentication tokens')
  }

  return createSupabaseClient({
    access_token,
    refresh_token,
  })
}

// For endpoints that don't need auth (like health check)
export const createSupabaseAnonymousClient = () => {
  return createClient(
    config.supabase.url,
    config.supabase.anonKey
  )
}
