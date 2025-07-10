import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { KycRecord } from '../../types'

export class AdminKycService {
	async fetchAllSubmissions(supabaseAdmin: any): Promise<KycRecord[]> {
		const { data, error } = await supabaseAdmin
			.from('kyc')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) {
			logger.error('Error fetching KYC submissions', { error })
			throw new AppError('Failed to fetch KYC submissions', 500)
		}

		return data as KycRecord[]
	}

	async updateSubmissionStatus(
		supabaseAdmin: any,
		submissionId: string,
		status: 'pending' | 'approved' | 'rejected'
	): Promise<void> {
		const { error } = await supabaseAdmin
			.from('kyc')
			.update({
				status,
				reviewed_at: new Date().toISOString(),
			})
			.eq('id', submissionId)

		if (error) {
			logger.error('Error updating KYC status', { error, submissionId })
			throw new AppError('Failed to update KYC status', 500)
		}
	}
}
