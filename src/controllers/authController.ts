import { Request, Response } from 'express'
import { AuthService } from '../services/authService'
import { EmailOtpType } from '@supabase/supabase-js'
import { authConfirmSchema } from '../validations'
import { AuthConfirmQuery } from '../types'
import { config } from '../config'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export class AuthController {
  private authService = new AuthService()

  confirmAuth = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as AuthConfirmQuery
    
    // Validate query parameters
    const validation = authConfirmSchema.safeParse(query)
    if (!validation.success) {
      logger.warn('Invalid OTP confirmation parameters', {
        errors: validation.error.format()
      })
      const errorUrl = `${config.frontendUrl}/error`
      return res.redirect(errorUrl)
    }

    const { token_hash, type } = validation.data
    const next = '/home'

    const result = await this.authService.verifyOtp(
      token_hash, 
      type as EmailOtpType
    )
    
    if (result.success) {
      const redirectUrl = `${config.frontendUrl}${next}`
      return res.redirect(redirectUrl)
    }

    // If verification failed, redirect to error page
    const errorUrl = `${config.frontendUrl}/error`
    return res.redirect(errorUrl)
  })

  signOut = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.signOut(req.supabase)
    
    res.json({
      message: 'Logged out successfully',
      status: 302,
    })
  })
}
