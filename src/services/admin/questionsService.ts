import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { QuestionInput } from '../../types'

export class AdminQuestionsService {
	async fetchQuestions(
		supabase: any,
		match_id: string,
		league_id: string
	): Promise<any[]> {
		const { data, error } = await supabase
			.from('questions')
			.select('*')
			.eq('match_id', match_id)
			.eq('league_id', league_id)

		if (error) {
			logger.error('Error fetching questions', { error })
			throw new AppError('Failed to fetch questions', 500)
		}

		return data
	}

	async insertQuestions(
		supabase: any,
		questions: QuestionInput[]
	): Promise<void> {
		const formatted = questions.map((q) => ({
			match_id: q.match_id,
			league_id: q.league_id,
			question: q.question,
		}))

		const { error } = await supabase.from('questions').insert(formatted)

		if (error) {
			logger.error('Error inserting questions', { error })
			throw new AppError('Failed to insert questions', 500)
		}
	}
}
