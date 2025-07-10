import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../../utils/errorHandler'
import { CricketAnswersService } from '../../services/cricket/answersService'
import { logger } from '../../utils/logger'
import { CricketAnswersQuery } from '../../types'
import { cricketAnswersQuerySchema } from '../../validations'

export class CricketAnswersController {
  private answersService = new CricketAnswersService()

  getAnswers = asyncHandler(async (req: Request, res: Response) => {
    // Get league_id from query params
    const query = req.query as CricketAnswersQuery

    // Validate query parameters
    const validation = cricketAnswersQuerySchema.safeParse(query)
    if (!validation.success) {
      throw new AppError('Invalid parameters', 400)
    }

    const { league_id } = validation.data

    if (league_id !== '3') {
      throw new AppError('Only league 3 is allowed', 403)
    }

    // Fetch all answers for users in this league
    const csvContent = await this.answersService.getAnswersAsCsv(
      req.supabase,
      league_id
    )

    // Set CSV response headers
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="league_3_answers.csv"')
    
    return res.send(csvContent)
  })
}