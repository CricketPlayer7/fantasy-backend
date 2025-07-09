import { SentimentResponse } from '../types'

export class SentimentService {
  constructor(private supabase: any) {}

  async getSentimentData(leagueId: number, matchId: number, questionId: number | null): Promise<SentimentResponse> {
    const { data: result, error } = await this.supabase.rpc(
      'get_sentiment_data',
      {
        p_league_id: leagueId,
        p_match_id: matchId,
        p_question_id: questionId,
      }
    )

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return result
  }
}
