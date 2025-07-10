import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { ReferralService } from '../services/referralService'
import { generateReferralSchema, redeemReferralSchema } from '../validations'

export class ReferralController {
  private referralService = new ReferralService()

  generateLink = asyncHandler(async (req: Request, res: Response) => {
    const validation = generateReferralSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Invalid request data', 400)
    }

    const { referralType, matchId } = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const result = await this.referralService.generateReferralLink(supabase, user.id, referralType, matchId)

    return res.json(result)
  })

  getMyReferrals = asyncHandler(async (req: Request, res: Response) => {
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const result = await this.referralService.getMyReferrals(supabase, user.id)

    return res.json(result)
  })

  redeemReferral = asyncHandler(async (req: Request, res: Response) => {
    const validation = redeemReferralSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Invalid request data', 400)
    }

    const { referralToken } = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const result = await this.referralService.redeemReferral(supabase, user.id, referralToken)

    return res.json(result)
  })
}
