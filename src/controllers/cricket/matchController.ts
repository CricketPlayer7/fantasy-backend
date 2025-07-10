import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../../utils/errorHandler'
import { CricketMatchService } from '../../services/cricket/matchService'
import { cricketMatchSchema } from '../../validations'

export class CricketMatchController {
  private matchService = new CricketMatchService()

  getMatch = asyncHandler(async (req: Request, res: Response) => {
    const validation = cricketMatchSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Invalid match ID', 400)
    }

    const { match_id } = validation.data
    const supabase = req.supabase
    if (!supabase) {
      throw new AppError('Authentication required', 401)
    }

    const match = await this.matchService.getMatch(supabase, match_id)

    return res.status(200).json({
      data: match
    })
  })

  getScorecard = asyncHandler(async (req: Request, res: Response) => {
    const validation = cricketMatchSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Invalid match ID', 400)
    }

    const { match_id } = validation.data
    const result = await this.matchService.getScorecard(match_id)

    return res.status(200).json(result)
  })
}
