import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminAnswersService } from '../../services/admin/answersService'
import {
	getAdminAnswersQuerySchema,
	saveAdminAnswersSchema,
} from '../../validations'
import { z } from 'zod'
import { AdminAnswer } from '../../types'

type GetQuery = z.infer<typeof getAdminAnswersQuerySchema>
type SaveBody = z.infer<typeof saveAdminAnswersSchema>

export class AdminAnswersController {
	private service = new AdminAnswersService()

	getAdminAnswers = asyncHandler(async (req: Request, res: Response) => {
		const { match_id, league_id }: GetQuery =
			getAdminAnswersQuerySchema.parse(req.query)

		const result: AdminAnswer[] = await this.service.fetchAnswers(
			req.supabaseAdmin,
			match_id,
			league_id
		)

		res.json({ success: true, data: result })
	})

	saveAdminAnswers = asyncHandler(async (req: Request, res: Response) => {
		const { match_id, league_id, question_answer }: SaveBody =
			saveAdminAnswersSchema.parse(req.body)

		await this.service.saveAnswers(
			req.supabaseAdmin,
			match_id,
			league_id,
			question_answer
		)

		res.json({ success: true, message: 'Answers saved successfully' })
	})
}
