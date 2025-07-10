import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminFinanceController } from '../../controllers/admin/financeController'

const router = express.Router()
const controller = new AdminFinanceController()

router.get('/stats', adminAuthMiddleware, controller.getMonthlyStats)
router.get('/export', adminAuthMiddleware, controller.exportGstToCsv)

export default router
