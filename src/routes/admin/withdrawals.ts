import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminWithdrawalsController } from '../../controllers/admin/withdrawalsController'

const router = express.Router()
const controller = new AdminWithdrawalsController()

router.get('/', adminAuthMiddleware, controller.getAll)
router.post('/', adminAuthMiddleware, controller.approveWithdrawal)
router.get('/stats', adminAuthMiddleware, controller.getStats)

export default router
