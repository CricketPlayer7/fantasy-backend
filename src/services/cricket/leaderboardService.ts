import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { MatchInfo, LeagueInfo } from '../../types'

interface LeaderboardParams {
  match_id: number
  league_id?: number
  type: string
  limit: number
  offset: number
}

export class CricketLeaderboardService {
  async getLeaderboard(supabase: any, params: LeaderboardParams) {
    try {
      const { match_id, league_id, type, limit, offset } = params
      let data, error
      let matchInfo: MatchInfo | null = null
      let leagueInfo: LeagueInfo | null = null

      // Fetch match metadata
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('series_name, match_status, match_format, venue')
        .eq('match_id', match_id)
        .single()

      if (!matchError && matchData) {
        matchInfo = {
          series_name: matchData.series_name,
          status: matchData.match_status,
          match_format: matchData.match_format,
          venue: matchData.venue
        }
      }

      // Fetch league metadata if league type
      if (type === 'league' && league_id) {
        const { data: leagueData, error: leagueError } = await supabase
          .from('league')
          .select('name, entry_fee, prize, no_of_questions')
          .eq('league_id', league_id)
          .single()

        if (!leagueError && leagueData) {
          leagueInfo = {
            name: leagueData.name,
            entry_fee: leagueData.entry_fee,
            prize: leagueData.prize,
            no_of_questions: leagueData.no_of_questions
          }
        }
      }

      // Fetch leaderboard data
      if (type === 'match') {
        const result = await supabase.rpc('get_match_leaderboard', {
          p_match_id: match_id,
          p_limit: limit,
          p_offset: offset
        })
        data = result.data
        error = result.error
      } else {
        const result = await supabase.rpc('get_league_leaderboard', {
          p_match_id: match_id,
          p_league_id: league_id,
          p_limit: limit,
          p_offset: offset
        })
        data = result.data
        error = result.error
      }

      if (error) {
        logger.error('Database error when fetching leaderboard:', {
          error: error.message,
          match_id,
          league_id,
          type
        })
        throw new AppError(`Failed to fetch leaderboard data: ${error.message}`, 500)
      }

      // Handle the function result structure
      let leaderboardItems = []
      let totalCount = 0
      let currentUserInfo = null

      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0]
        leaderboardItems = result.items || []
        totalCount = result.total_count || 0
        currentUserInfo = result.current_user_info // Current user info
      }

      logger.info('Generated leaderboard for', {
        match_id,
        league_id,
        type,
        totalCount
      })

      // Format and return the response
      return {
        success: true,
        type: type,
        match_id,
        league_id: league_id || null,
        metadata: {
          match: matchInfo,
          league: leagueInfo,
          generated_at: new Date().toISOString()
        },
        data: {
          leaderboard: leaderboardItems,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / limit),
          current_page: Math.floor(offset / limit) + 1,
          limit,
          offset,
          current_user: currentUserInfo
        }
      }
    } catch (error) {
      logger.error('Error in getLeaderboard service:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to generate leaderboard',
        500
      )
    }
  }
}