import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../../utils/errorHandler'
import { CricketLeagueService } from '../../services/cricket/leagueService'
import { logger } from '../../utils/logger'
import { CricketLeagueQuery } from '../../types'
import { cricketLeagueParticipantsCountSchema, leagueIdSchema } from '../../validations'

export class CricketLeagueController {
  private leagueService = new CricketLeagueService()

  getLeagues = asyncHandler(async (req: Request, res: Response) => {
    // Use authenticated supabase client from auth middleware
    const supabase = req.supabase
    if (!supabase) {
      throw new AppError('Authentication required', 401)
    }

    // Get all enabled leagues
    const leagues = await this.leagueService.getEnabledLeagues(supabase)
    
    logger.info('Leagues fetched successfully', {
      userId: req.user?.id,
      leagueCount: leagues.length
    })
    
    return res.json({
      data: leagues
    })
  })

  getLeagueById = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validationResult = leagueIdSchema.safeParse(req.body)
    if (!validationResult.success) {
      throw new AppError('Invalid league ID', 400)
    }

    const { league_id } = validationResult.data

    // Use authenticated supabase client from auth middleware
    const supabase = req.supabase
    if (!supabase) {
      throw new AppError('Authentication required', 401)
    }

    // Get league by ID
    const league = await this.leagueService.getLeagueById(supabase, league_id)
    
    logger.info('League fetched by ID successfully', {
      userId: req.user?.id,
      leagueId: league_id
    })
    
    return res.json({
      data: league
    })
  })

  getParticipantsCount = asyncHandler(async (req: Request, res: Response) => {
    // Get query parameters
    const query = req.query as CricketLeagueQuery

    // Validate query parameters
    const validationResult = cricketLeagueParticipantsCountSchema.safeParse(query)
    if (!validationResult.success) {
      throw new AppError('Missing match_id or league_id', 400)
    }

    const { match_id, league_id } = validationResult.data

    // Use authenticated supabase client from auth middleware
    const supabase = req.supabase
    if (!supabase) {
      throw new AppError('Authentication required', 401)
    }

    // Get participants count
    const count = await this.leagueService.getParticipantsCount(
      supabase,
      match_id,
      league_id
    )

    logger.info('Participants count fetched successfully', {
      userId: req.user?.id,
      matchId: match_id,
      leagueId: league_id,
      count
    })

    // Set cache header
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=90')
    
    return res.json({ count })
  })
}