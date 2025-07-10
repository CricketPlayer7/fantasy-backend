import { SentimentResponse } from '../types'
import { AppError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export class SentimentService {
  constructor(private supabase: any) {}

  async getSentimentData(leagueId: number, matchId: number, questionId: number | null): Promise<SentimentResponse> {
    try {
      const { data: result, error } = await this.supabase.rpc(
        'get_sentiment_data',
        {
          p_league_id: leagueId,
          p_match_id: matchId,
          p_question_id: questionId,
        }
      )

      if (error) {
        logger.error('Database error when fetching sentiment data:', { 
          error: error.message,
          leagueId,
          matchId,
          questionId
        })
        throw new AppError(`Database error: ${error.message}`, 500)
      }

      return result
    } catch (error) {
      logger.error('Error in getSentimentData service:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to fetch sentiment data', 500)
    }
  }
}
