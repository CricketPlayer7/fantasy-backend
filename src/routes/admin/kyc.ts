import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminKycController } from '../../controllers/admin/kycController'

const router = express.Router()
const controller = new AdminKycController()

router.get('/', adminAuthMiddleware, controller.getAllSubmissions)
router.post('/', adminAuthMiddleware, controller.updateSubmissionStatus)

export default router
