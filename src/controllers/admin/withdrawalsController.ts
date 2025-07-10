import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminWithdrawalsService } from '../../services/admin/withdrawalsService'
import { approveWithdrawalSchema } from '../../validations'
import { WithdrawalApproval, WithdrawalStats } from '../../types'

export class AdminWithdrawalsController {
	private service = new AdminWithdrawalsService()

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const result: WithdrawalApproval[] =
			await this.service.getAllWithdrawals(req.supabaseAdmin)
		res.json({ success: true, data: result })
	})

	approveWithdrawal = asyncHandler(async (req: Request, res: Response) => {
		const { withdrawal_id, user_id, amount } =
			approveWithdrawalSchema.parse(req.body)
		await this.service.approveWithdrawal(
			req.supabaseAdmin,
			withdrawal_id,
			user_id,
			amount
		)
		res.json({ success: true, message: 'Withdrawal approved successfully' })
	})

	getStats = asyncHandler(async (req: Request, res: Response) => {
		const stats: WithdrawalStats = await this.service.getMonthlyStats(
			req.supabaseAdmin
		)
		res.json({ success: true, data: stats })
	})
}
