import { Request, Response } from 'express'
import { CouponsService } from '../services/couponsService'
import { applyCouponSchema } from '../validations'
import { asyncHandler, AppError } from '../utils/errorHandler'

export class CouponsController {
  private couponsService = new CouponsService()

  applyCoupon = asyncHandler(async (req: Request, res: Response) => {
    // Validate coupon application data
    const validationResult = applyCouponSchema.safeParse(req.body)
    if (!validationResult.success) {
      throw new AppError('Invalid coupon application data', 400)
    }

    const { coupon_code, amount, usage_type, league_id, match_id } = validationResult.data

    // Additional validation for league_entry
    if (usage_type === 'league_entry' && (!league_id || !match_id)) {
      throw new AppError('League ID and Match ID are required for league entry coupons', 400)
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

    // The RPC function returns a JSON object with success/error handling built-in
    if (!result.success) {
      throw new AppError(result.error || 'Failed to apply coupon', 400)
    }

    return res.json(result)
  })

  getUserAvailableCoupons = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user.id
    
    // Get available coupons for the user
    const result = await this.couponsService.getUserAvailableCoupons(
      req.supabase,
      user_id
    )

    return res.json(result)
  })
}