import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { League, UpdateLeagueInput } from '../../types'

export class AdminLeagueService {
	async fetchAllLeagues(supabaseAdmin: any): Promise<League[]> {
		const { data, error } = await supabaseAdmin
			.from('league')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) {
			logger.error('Failed to fetch leagues', { error })
			throw new AppError('Unable to fetch league data', 500)
		}

		return data as League[]
	}

	async updateLeague(
		supabaseAdmin: any,
		data: UpdateLeagueInput
	): Promise<void> {
		const { id, ...updateFields } = data

		const { error } = await supabaseAdmin
			.from('league')
			.update(updateFields)
			.eq('id', id)

		if (error) {
			logger.error('Failed to update league', { error, id })
			throw new AppError('Failed to update league', 500)
		}
	}
}
