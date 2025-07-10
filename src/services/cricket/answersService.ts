import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { UserAnswer } from '../../types'

export class CricketAnswersService {
  async getAnswersAsCsv(supabase: any, leagueId: string): Promise<string> {
    try {
      // Fetch all answers for users in this league
      const { data: answers, error } = await supabase
        .from('user_answers')
        .select(`
          user_id,
          league_id,
          match_id,
          question_id,
          answer,
          entry_id,
          ref_entry_id
        `)
        .eq('league_id', leagueId)

      if (error) {
        logger.error('Failed to fetch answers:', error)
        throw new AppError('Failed to fetch answers', 500)
      }

      // Convert to CSV
      const csvHeaders = [
        'user_id',
        'league_id',
        'match_id',
        'question_id',
        'answer',
        'entry_id',
        'ref_entry_id'
      ]
      
      const csvRows = [
        csvHeaders.join(','),
        ...((answers as UserAnswer[]) || []).map((row: UserAnswer) =>
          csvHeaders.map(h => row[h] !== null && row[h] !== undefined ? `"${row[h]}"` : '').join(',')
        )
      ]
      
      const csvContent = csvRows.join('\n')
      
      logger.info('Generated answers CSV for league', { leagueId, rowCount: answers?.length })
      
      return csvContent
    } catch (error) {
      logger.error('Error in getAnswersAsCsv service:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to generate answers CSV', 500)
    }
  }
}