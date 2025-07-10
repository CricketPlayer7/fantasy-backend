import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminLeagueService } from '../../services/admin/leagueService'
import { updateLeagueSchema } from '../../validations'
import { League } from '../../types'
import { z } from 'zod'

type UpdateLeagueInput = z.infer<typeof updateLeagueSchema>

export class AdminLeagueController {
	private service = new AdminLeagueService()

	getAllLeagues = asyncHandler(async (req: Request, res: Response) => {
		const result: League[] = await this.service.fetchAllLeagues(
			req.supabaseAdmin
		)
		res.json({ success: true, data: result })
	})

	updateLeague = asyncHandler(async (req: Request, res: Response) => {
		const data: UpdateLeagueInput = updateLeagueSchema.parse(req.body)
		await this.service.updateLeague(req.supabaseAdmin, data)
		res.json({ success: true, message: 'League updated successfully' })
	})
}
