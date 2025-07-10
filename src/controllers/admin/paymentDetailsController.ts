import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminPaymentDetailsService } from '../../services/admin/paymentDetailsService'
import { paymentDetailsQuerySchema } from '../../validations'
import { z } from 'zod'

type QueryInput = z.infer<typeof paymentDetailsQuerySchema>

export class AdminPaymentDetailsController {
	private service = new AdminPaymentDetailsService()

	getPaymentDetails = asyncHandler(async (req: Request, res: Response) => {
		const query: QueryInput = paymentDetailsQuerySchema.parse(req.query)

		const data = await this.service.fetchPaymentDetails(
			req.supabaseAdmin,
			query.user_id,
			query.method
		)

		res.json({ success: true, data })
	})
}
