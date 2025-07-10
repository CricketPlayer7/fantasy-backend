import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { AdminAnswer } from '../../types'

export class AdminAnswersService {
	async fetchAnswers(
		supabaseAdmin: any,
		match_id: string,
		league_id: string
	): Promise<AdminAnswer[]> {
		const { data, error } = await supabaseAdmin
			.from('admin_answers')
			.select('*')
			.eq('match_id', match_id)
			.eq('league_id', league_id)

		if (error) {
			logger.error('Failed to fetch admin answers', {
				error,
				match_id,
				league_id,
			})
			throw new AppError('Failed to fetch admin answers', 500)
		}

		return data as AdminAnswer[]
	}

	async saveAnswers(
		supabaseAdmin: any,
		match_id: string,
		league_id: string,
		question_answer: any
	): Promise<void> {
		const { error: deleteError } = await supabaseAdmin
			.from('admin_answers')
			.delete()
			.eq('match_id', match_id)
			.eq('league_id', league_id)

		if (deleteError) {
			logger.error('Failed to delete old answers', {
				deleteError,
				match_id,
				league_id,
			})
			throw new AppError('Failed to delete existing answers', 500)
		}

		const { error: insertError } = await supabaseAdmin
			.from('admin_answers')
			.insert({ match_id, league_id, question_answer })

		if (insertError) {
			logger.error('Failed to insert new answers', { insertError })
			throw new AppError('Failed to insert answers', 500)
		}
	}
}
