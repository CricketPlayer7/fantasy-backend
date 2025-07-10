import { Request, Response, NextFunction } from 'express'
import { AdminKycService } from '../../services/admin/kycService'
import { asyncHandler } from '../../utils/errorHandler'
import { updateKycStatusSchema } from '../../validations'
import { logger } from '../../utils/logger'

export class AdminKycController {
	private service = new AdminKycService()

	getAllSubmissions = asyncHandler(async (req: Request, res: Response) => {
		logger.info('Fetching KYC submissions', { userId: req.user?.id })

		const result = await this.service.fetchAllSubmissions(req.supabaseAdmin)
		res.json({ success: true, data: result })
	})

	updateSubmissionStatus = asyncHandler(
		async (req: Request, res: Response) => {
			logger.info('Updating KYC status', {
				userId: req.user?.id,
				body: req.body,
			})

			const { submissionId, status } = updateKycStatusSchema.parse(
				req.body
			)
			await this.service.updateSubmissionStatus(
				req.supabaseAdmin,
				submissionId,
				status
			)

			res.json({
				success: true,
				message: 'KYC status updated successfully',
			})
		}
	)
}
