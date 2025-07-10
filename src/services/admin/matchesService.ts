import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { MatchQueryInput, MatchActionInput } from '../../types'

export class AdminMatchesService {
	async getMatches(supabase: any, query: MatchQueryInput) {
		let supaQuery = supabase
			.from('matches')
			.select('*')
			.eq('series_type', query.series_type)
			.order('start', { ascending: true })

		if (query.match_state && query.match_state !== 'all') {
			const state =
				query.match_state === 'ongoing'
					? 'in progress'
					: query.match_state
			supaQuery = supaQuery.eq('match_state', state)
		}

		if (query.search && query.search.length > 0) {
			supaQuery = supaQuery.or(
				`team_one_name.ilike.%${query.search}%,team_two_name.ilike.%${query.search}%,team_one_sname.ilike.%${query.search}%,team_two_sname.ilike.%${query.search}%`
			)
		}

		const { data, error } = await supaQuery

		if (error) {
			logger.error('Failed to fetch matches', { error })
			throw new AppError('Error fetching matches', 500)
		}

		return data
	}

	async updateMatchAction(
		supabase: any,
		input: MatchActionInput
	): Promise<void> {
		const { match_id, action } = input

		if (action === 'publish') {
			const { error } = await supabase
				.from('matches')
				.update({ is_match_enabled: true })
				.eq('match_id', match_id)

			if (error) {
				logger.error('Failed to publish match', { error })
				throw new AppError('Error publishing match', 500)
			}
		} else if (action === 'void') {
			const { error: insertError } = await supabase
				.from('void_matches')
				.insert({ match_id })

			if (insertError) {
				logger.error('Failed to insert void match', { insertError })
				throw new AppError('Error voiding match', 500)
			}

			const { error: updateError } = await supabase
				.from('matches')
				.update({ is_voided: true })
				.eq('match_id', match_id)

			if (updateError) {
				logger.error('Failed to mark match as voided', { updateError })
				throw new AppError('Error voiding match', 500)
			}
		}
	}
}
