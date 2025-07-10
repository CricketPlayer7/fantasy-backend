import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'

export class AdminPaymentDetailsService {
	async fetchPaymentDetails(
		supabase: any,
		user_id: string,
		method: 'bank' | 'upi'
	): Promise<any> {
		const table = method === 'bank' ? 'bank_details' : 'upi_details'

		const { data, error } = await supabase
			.from(table)
			.select('*')
			.eq('user_id', user_id)
			.single()

		if (error) {
			logger.error(`Error fetching ${method} details`, { error })
			throw new AppError(`Failed to fetch ${method} details`, 500)
		}

		return data
	}
}
