import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../../utils/errorHandler'
import { CricketLeagueService } from '../../services/cricket/leagueService'
import { logger } from '../../utils/logger'
import { CricketLeagueQuery } from '../../types'
import { cricketLeagueParticipantsCountSchema, leagueIdSchema } from '../../validations'
import { createClient } from '@supabase/supabase-js'
import { config } from '../../config'

export class CricketLeagueController {
  private leagueService = new CricketLeagueService()

  getLeagues = asyncHandler(async (req: Request, res: Response) => {
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

    // Get all enabled leagues
    const leagues = await this.leagueService.getEnabledLeagues(supabase)
    
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

    // Get league by ID
    const league = await this.leagueService.getLeagueById(supabase, league_id)
    
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

    // Get participants count
    const count = await this.leagueService.getParticipantsCount(
      supabase,
      match_id,
      league_id
    )

    // Set cache header
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=90')
    
    return res.json({ count })
  })
}