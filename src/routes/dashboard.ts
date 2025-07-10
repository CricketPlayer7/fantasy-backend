import express from 'express'
import { adminAuthMiddleware } from '../middleware/adminAuth'
import { DashboardController } from '../controllers/dashboardController'

const router = express.Router()
const dashboardController = new DashboardController()

router.get('/', adminAuthMiddleware, dashboardController.getDashboardData.bind(dashboardController))

export default router
