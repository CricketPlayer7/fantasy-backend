import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../../utils/errorHandler'
import { CricketLeaderboardService } from '../../services/cricket/leaderboardService'
import { logger } from '../../utils/logger'
import { CricketLeaderboardQuery } from '../../types'
import { cricketLeaderboardQuerySchema } from '../../validations'

export class CricketLeaderboardController {
  private leaderboardService = new CricketLeaderboardService()

  getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    // Get query parameters
    const query = req.query as CricketLeaderboardQuery

    // Validate query parameters
    const validation = cricketLeaderboardQuerySchema.safeParse(query)
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400)
    }

    const { match_id, league_id, type, limit, offset } = validation.data

    // Use authenticated supabase client from auth middleware
    const supabase = req.supabase
    if (!supabase) {
      throw new AppError('Authentication required', 401)
    }

    // Get leaderboard data
    const result = await this.leaderboardService.getLeaderboard(
      supabase,
      {
        match_id: parseInt(match_id),
        league_id: league_id ? parseInt(league_id) : undefined,
        type,
        limit,
        offset
      }
    )

    logger.info('Leaderboard fetched successfully', {
      userId: req.user?.id,
      matchId: match_id,
      leagueId: league_id,
      type,
      limit,
      offset
    })

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300')
    
    return res.json(result)
  })
}