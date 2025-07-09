import { Request, Response } from 'express'
import { SentimentService } from '../services/sentimentService'
import { sentimentQuerySchema } from '../validations'
import { SentimentQuery } from '../types'

export class SentimentController {
	async getSentiment(req: Request, res: Response) {
		try {
			const query = req.query as SentimentQuery

			// Validate query parameters
			const validation = sentimentQuerySchema.safeParse(query)
			if (!validation.success) {
				res.status(400).json({
					success: false,
					error: 'Invalid parameters',
					details: validation.error.format(),
				})
				return
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
				res.status(statusCode).json(result)
				return
			}

			res.json(result)
		} catch (error) {
			console.error('Error in sentiment API:', error)
			res.status(500).json({
				success: false,
				error: 'Internal server error',
				message: 'An unexpected error occurred',
			})
		}
	}
}
