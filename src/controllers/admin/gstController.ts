import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminGstService } from '../../services/admin/gstService'
import { gstQuerySchema } from '../../validations'
import { logger } from '../../utils/logger'
import { GstPaginationResult } from '../../types'
import { z } from 'zod'

type GstQuery = z.infer<typeof gstQuerySchema>

export class AdminGstController {
	private service = new AdminGstService()

	getPaginatedGst = asyncHandler(async (req: Request, res: Response) => {
		logger.info('Fetching GST data', {
			userId: req.user?.id,
			query: req.query,
		})

		const { page, limit }: GstQuery = gstQuerySchema.parse(req.query)

		const result: GstPaginationResult = await this.service.getPaginatedGst(
			req.supabaseAdmin,
			page,
			limit
		)

		res.json({
			success: true,
			data: result.data,
			pagination: {
				page,
				limit,
				total: result.total,
				totalPages: Math.ceil(result.total / limit),
			},
		})
	})
}
