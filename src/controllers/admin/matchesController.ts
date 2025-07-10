import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminMatchesService } from '../../services/admin/matchesService'
import { matchQuerySchema, matchActionSchema } from '../../validations'
import { z } from 'zod'

type MatchQueryInput = z.infer<typeof matchQuerySchema>
type MatchActionInput = z.infer<typeof matchActionSchema>

export class AdminMatchesController {
	private service = new AdminMatchesService()

	getMatches = asyncHandler(async (req: Request, res: Response) => {
		const query: MatchQueryInput = matchQuerySchema.parse(req.query)
		const data = await this.service.getMatches(req.supabaseAdmin, query)
		res.json({ success: true, data })
	})

	updateMatchAction = asyncHandler(async (req: Request, res: Response) => {
		const input: MatchActionInput = matchActionSchema.parse(req.body)
		await this.service.updateMatchAction(req.supabaseAdmin, input)
		res.json({ success: true, message: 'Match updated successfully' })
	})
}
