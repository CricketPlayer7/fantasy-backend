import { createClient } from '@supabase/supabase-js'
import { EmailOtpType } from '@supabase/supabase-js'
import { config } from '../config'
import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'

export class AuthService {
  private createSupabaseClient() {
    return createClient(
      config.supabase.url,
      config.supabase.anonKey
    )
  }

  async verifyOtp(tokenHash: string, type: EmailOtpType) {
    try {
      const supabase = this.createSupabaseClient()
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      })
      
      if (error) {
        logger.warn('OTP verification failed:', { error: error.message, type })
        throw new AppError('OTP verification failed', 400)
      }
      
      logger.info('OTP verified successfully', { type })
      return { success: true }
    } catch (error) {
      logger.error('Error in OTP verification:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('OTP verification failed', 500)
    }
  }

  async signOut(supabase: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase.auth.signOut()
        logger.info('User signed out successfully', { userId: user.id })
      }
      
      return { success: true }
    } catch (error) {
      logger.error('Error in sign out:', error)
      throw new AppError('Sign out failed', 500)
    }
  }
}
