import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { GstPaginationResult, GstRecord } from '../../types'

export class AdminGstService {
	async getPaginatedGst(
		supabaseAdmin: any,
		page: number,
		limit: number
	): Promise<GstPaginationResult> {
		const from = (page - 1) * limit
		const to = from + limit - 1

		const { data, error, count } = await supabaseAdmin
			.from('gst')
			.select('*', { count: 'exact' })
			.order('created_at', { ascending: false })
			.range(from, to)

		if (error) {
			logger.error('Failed to fetch GST data', { error })
			throw new AppError('Unable to fetch GST data', 500)
		}

		return {
			data: (data || []) as GstRecord[],
			total: count || 0,
		}
	}
}
