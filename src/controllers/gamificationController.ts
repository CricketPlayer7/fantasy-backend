import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { GamificationService } from '../services/gamificationService'
import { gamificationQuerySchema, badgeProgressQuerySchema, predictionResultsQuerySchema, tierProgressQuerySchema } from '../validations'

export class GamificationController {
  private gamificationService = new GamificationService()

  getGamificationData = asyncHandler(async (req: Request, res: Response) => {
    const validation = gamificationQuerySchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Invalid query parameters', 400)
    }

    const { type } = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const data = await this.gamificationService.getGamificationData(supabase, user.id, type)

    return res.json({
      success: true,
      type: type || 'all',
      data
    })
  })

  getBadges = asyncHandler(async (req: Request, res: Response) => {
    const validation = badgeProgressQuerySchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Invalid query parameters', 400)
    }

    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const data = await this.gamificationService.getBadges(supabase, user.id)

    return res.json({
      success: true,
      data
    })
  })

  getPredictionResults = asyncHandler(async (req: Request, res: Response) => {
    const validation = predictionResultsQuerySchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Invalid query parameters', 400)
    }

    const { match_id, league_id } = validation.data
    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const data = await this.gamificationService.getPredictionResults(supabase, user.id, match_id, league_id)

    return res.json({
      success: true,
      data
    })
  })

  getTiers = asyncHandler(async (req: Request, res: Response) => {
    const validation = tierProgressQuerySchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Invalid query parameters', 400)
    }

    const supabase = req.supabase
    const user = req.user

    if (!supabase || !user) {
      throw new AppError('Authentication required', 401)
    }

    const data = await this.gamificationService.getTiers(supabase, user.id)

    return res.json({
      success: true,
      data
    })
  })
}
