import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/errorHandler'
import { AdminQuestionsService } from '../../services/admin/questionsService'
import {
	getQuestionsQuerySchema,
	saveQuestionsBodySchema,
} from '../../validations'
import { z } from 'zod'

type GetQuery = z.infer<typeof getQuestionsQuerySchema>
type PostBody = z.infer<typeof saveQuestionsBodySchema>

export class AdminQuestionsController {
	private service = new AdminQuestionsService()

	getQuestions = asyncHandler(async (req: Request, res: Response) => {
		const query: GetQuery = getQuestionsQuerySchema.parse(req.query)
		const result = await this.service.fetchQuestions(
			req.supabaseAdmin,
			query.match_id,
			query.league_id
		)
		res.json({ success: true, data: result })
	})

	saveQuestions = asyncHandler(async (req: Request, res: Response) => {
		const body: PostBody = saveQuestionsBodySchema.parse(req.body)
		await this.service.insertQuestions(req.supabaseAdmin, body.questions)
		res.json({ success: true, message: 'Questions saved successfully' })
	})
}
