import { Request, Response } from 'express'
import { SentimentService } from '../services/sentimentService'
import { sentimentQuerySchema } from '../validations'
import { SentimentQuery } from '../types'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export class SentimentController {
	getSentiment = asyncHandler(async (req: Request, res: Response) => {
		const query = req.query as SentimentQuery

		// Validate query parameters
		const validation = sentimentQuerySchema.safeParse(query)
		if (!validation.success) {
			throw new AppError('Invalid parameters', 400)
		}

		const { league_id, match_id, question_id } = validation.data
		const leagueIdNum = parseInt(league_id)
		const matchIdNum = parseInt(match_id)
		const questionIdNum = question_id ? parseInt(question_id) : null

		const sentimentService = new SentimentService(req.supabase)
		const result = await sentimentService.getSentimentData(
			leagueIdNum,
			matchIdNum,
			questionIdNum
		)

		if (!result.success) {
			const statusCode = result.error === 'No data found' ? 404 : 400
			throw new AppError(result.error || 'No data found', statusCode)
		}

		res.json(result)
	})
}
