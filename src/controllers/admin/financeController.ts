import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminFinanceService } from '../../services/admin/financeService'
import { logger } from '../../utils/logger'

export class AdminFinanceController {
	private service = new AdminFinanceService()

	getMonthlyStats = asyncHandler(async (req: Request, res: Response) => {
		const month = req.query.month as string

		if (!month) {
			return res
				.status(400)
				.json({ error: 'Month parameter is required' })
		}

		const result = await this.service.getMonthlyStats(
			req.supabaseAdmin,
			month
		)
		res.json({ success: true, data: result })
		return
	})

	exportGstToCsv = asyncHandler(async (req: Request, res: Response) => {
		const fromDate = req.query.fromDate as string
		const toDate = req.query.toDate as string

		if (!fromDate || !toDate) {
			return res
				.status(400)
				.json({ error: 'From date and to date are required' })
		}

		const { csv, filename } = await this.service.exportGstData(
			req.supabaseAdmin,
			fromDate,
			toDate
		)

		res.setHeader('Content-Type', 'text/csv')
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${filename}"`
		)
		res.status(200).send(csv)
		return
	})
}
