import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminUserService } from '../../services/admin/userService'
import {
	adminUsersPaginationSchema,
	banUserSchema,
	walletBonusSchema,
} from '../../validations'

export class AdminUserController {
	private service = new AdminUserService()

	getUsers = asyncHandler(async (req: Request, res: Response) => {
		const { page, perPage, showBots } = adminUsersPaginationSchema.parse(req.query)
		const data = await this.service.getUsers(
			req.supabaseAdmin,
			page,
			perPage,
			showBots
		)
		res.json({ success: true, ...data })
	})

	banUser = asyncHandler(async (req: Request, res: Response) => {
		const { user_id, ban } = banUserSchema.parse(req.body)
		await this.service.banUser(req.supabaseAdmin, user_id, ban)
		res.json({ success: true, message: 'User ban status updated' })
	})

	addWalletBonus = asyncHandler(async (req: Request, res: Response) => {
		const { user_id, amount } = walletBonusSchema.parse(req.body)
		await this.service.addWalletBonus(req.supabaseAdmin, user_id, amount)
		res.json({ success: true, message: 'Wallet updated successfully' })
	})
}
