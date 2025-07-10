import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminAnswersController } from '../../controllers/admin/answersController'

const router = express.Router()
const controller = new AdminAnswersController()

router.get('/', adminAuthMiddleware, controller.getAdminAnswers)
router.post('/', adminAuthMiddleware, controller.saveAdminAnswers)

export default router
