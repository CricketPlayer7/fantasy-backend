import { Request, Response } from 'express'
import { DashboardService } from '../services/dashboardService'
import { asyncHandler } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export class DashboardController {
  private dashboardService = new DashboardService()

  getDashboardData = asyncHandler(async (req: Request, res: Response) => {
    logger.info('Fetching dashboard data', { userId: req.user?.id })
    
    const dashboardData = await this.dashboardService.getDashboardData(req.supabaseAdmin)
    
    res.json({
      success: true,
      data: dashboardData
    })
  })
}
