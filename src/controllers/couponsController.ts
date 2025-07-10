import { Request, Response } from 'express'
import { CouponsService } from '../services/couponsService'
import { applyCouponSchema } from '../validations'
import { logger } from '../utils/logger'
import { asyncHandler } from '../utils/errorHandler'

export class CouponsController {
  private couponsService = new CouponsService()

  applyCoupon = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Validate coupon application data
      const validationResult = applyCouponSchema.safeParse(req.body)
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid coupon application data',
          details: validationResult.error.format(),
        })
      }

      const { coupon_code, amount, usage_type, league_id, match_id } = validationResult.data

      // Additional validation for league_entry
      if (usage_type === 'league_entry' && (!league_id || !match_id)) {
        return res.status(400).json({
          error: 'League ID and Match ID are required for league entry coupons',
        })
      }

      // Use the authenticated user's ID
      const user_id = req.user.id

      // Apply the coupon
      const result = await this.couponsService.applyCoupon(
        req.supabase,
        coupon_code,
        user_id,
        amount,
        usage_type,
        league_id,
        match_id
      )

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        })
      }

      return res.json(result)
    } catch (error: any) {
      logger.error('Error applying coupon:', error)
      return res.status(500).json({
        error: 'Failed to apply coupon',
        details: error.message,
      })
    }
  })

  getUserAvailableCoupons = asyncHandler(async (req: Request, res: Response) => {
    try {
      const user_id = req.user.id
      
      // Get available coupons for the user
      const result = await this.couponsService.getUserAvailableCoupons(
        req.supabase,
        user_id
      )

      return res.json(result)
    } catch (error: any) {
      logger.error('Error fetching available coupons:', error)
      return res.status(500).json({
        error: 'Failed to fetch available coupons',
        details: error.message,
      })
    }
  })
}