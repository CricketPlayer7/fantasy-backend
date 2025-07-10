import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../../utils/errorHandler'
import { CricketLeaderboardService } from '../../services/cricket/leaderboardService'
import { logger } from '../../utils/logger'
import { CricketLeaderboardQuery } from '../../types'
import { cricketLeaderboardQuerySchema } from '../../validations'
import { createClient } from '@supabase/supabase-js'
import { config } from '../../config'

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

    // Create supabase client without auth (public endpoint)
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

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300')
    
    return res.json(result)
  })
}