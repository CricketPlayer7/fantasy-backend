import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../../utils/errorHandler'
import { CricketMatchesService } from '../../services/cricket/matchesService'
import { logger } from '../../utils/logger'
import { CricketMatchesListBody, PaginationQuery } from '../../types'
import { cricketMatchesListSchema, paginationQuerySchema } from '../../validations'

export class CricketMatchesController {
  private matchesService = new CricketMatchesService()

  getMatchesList = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const bodyValidation = cricketMatchesListSchema.safeParse(req.body)
    if (!bodyValidation.success) {
      throw new AppError('Invalid request body', 400)
    }

    // Validate query parameters for pagination
    const queryValidation = paginationQuerySchema.safeParse(req.query)
    if (!queryValidation.success) {
      throw new AppError('Invalid pagination parameters', 400)
    }

    const filters = bodyValidation.data
    const pagination = queryValidation.data

    // Use authenticated supabase client from auth middleware
    const supabase = req.supabase
    if (!supabase) {
      throw new AppError('Authentication required', 401)
    }

    // Get matches with pagination
    const result = await this.matchesService.getMatches(
      supabase,
      filters,
      pagination
    )

    logger.info('Matches fetched successfully', {
      userId: req.user?.id,
      filters,
      pagination,
      totalItems: result.pagination.totalItems
    })

    return res.status(200).json(result)
  })
}
