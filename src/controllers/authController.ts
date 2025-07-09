import { Request, Response } from 'express'
import { AuthService } from '../services/authService'
import { EmailOtpType } from '@supabase/supabase-js'
import { authConfirmSchema } from '../validations'
import { AuthConfirmQuery } from '../types'
import { config } from '../config'

export class AuthController {
  private authService = new AuthService()

  async confirmAuth(req: Request, res: Response) {
    try {
      const query = req.query as AuthConfirmQuery
      
      // Validate query parameters
      const validation = authConfirmSchema.safeParse(query)
      if (!validation.success) {
        const errorUrl = `${config.frontendUrl}/error`
        return res.redirect(errorUrl)
      }

      const { token_hash, type } = validation.data
      const next = '/home'

      const { error } = await this.authService.verifyOtp(
        token_hash, 
        type as EmailOtpType
      )
      
      if (!error) {
        const redirectUrl = `${config.frontendUrl}${next}`
        return res.redirect(redirectUrl)
      }

      const errorUrl = `${config.frontendUrl}/error`
      return res.redirect(errorUrl)
    } catch (error) {
      console.error('Error confirming auth:', error)
      const errorUrl = `${config.frontendUrl}/error`
      return res.redirect(errorUrl)
    }
  }

  async signOut(req: Request, res: Response) {
    try {
      await this.authService.signOut(req.supabase)
      
      res.json({
        message: 'Logged out successfully',
        status: 302,
      })
    } catch (error) {
      console.error('Error signing out:', error)
      res.status(500).json({ error: 'Failed to sign out' })
    }
  }
}
