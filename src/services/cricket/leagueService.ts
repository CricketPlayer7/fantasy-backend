import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { League } from '../../types'

export class CricketLeagueService {
  async getEnabledLeagues(supabase: any): Promise<League[]> {
    try {
      const { data: leagues, error } = await supabase
        .from('league')
        .select('*')
        .eq('enabled', true)
        .order('league_id', { ascending: true })

      if (error) {
        logger.error('Database error when fetching leagues:', error)
        throw new AppError(`Failed to fetch leagues: ${error.message}`, 500)
      }

      logger.info('Fetched enabled leagues', { count: leagues?.length })
      return leagues || []
    } catch (error) {
      logger.error('Error in getEnabledLeagues service:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to fetch leagues',
        500
      )
    }
  }

  async getLeagueById(supabase: any, leagueId: number): Promise<League[]> {
    try {
      const { data: league, error } = await supabase
        .from('league')
        .select('*')
        .eq('league_id', leagueId)

      if (error) {
        logger.error('Database error when fetching league by ID:', {
          error: error.message,
          leagueId
        })
        throw new AppError(`Failed to fetch league: ${error.message}`, 500)
      }

      logger.info('Fetched league by ID', { leagueId })
      return league || []
    } catch (error) {
      logger.error('Error in getLeagueById service:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to fetch league',
        500
      )
    }
  }

  async getParticipantsCount(supabase: any, matchId: string, leagueId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_participant_count', {
        p_match_id: matchId,
        p_league_id: leagueId
      })

      if (error) {
        logger.error('Database error when fetching participants count:', {
          error: error.message,
          matchId,
          leagueId
        })
        throw new AppError(`Failed to fetch participants count: ${error.message}`, 500)
      }

      logger.info('Fetched participants count', { matchId, leagueId, count: data })
      return data || 0
    } catch (error) {
      logger.error('Error in getParticipantsCount service:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to fetch participants count',
        500
      )
    }
  }
}