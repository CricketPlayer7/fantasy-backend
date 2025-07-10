import { Request, Response } from 'express'
import { GetUsersService } from '../services/getUsersService'
import { asyncHandler } from '../utils/errorHandler'
import { logger } from '../utils/logger'
import { getUsersQuerySchema } from '../validations'

export class GetUsersController {
  private getUsersService = new GetUsersService()

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    logger.info('Fetching users list', { 
      userId: req.user?.id,
      query: req.query 
    })
    
    // Validate query parameters
    const validatedQuery = getUsersQuerySchema.parse(req.query)
    
    const result = await this.getUsersService.getUsers(req.supabaseAdmin, validatedQuery)
    
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination
    })
  })

  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    logger.info('Fetching user statistics', { userId: req.user?.id })
    
    const stats = await this.getUsersService.getUserStats(req.supabaseAdmin)
    
    res.json({
      success: true,
      data: stats
    })
  })
}
