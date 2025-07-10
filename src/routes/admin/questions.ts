import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminQuestionsController } from '../../controllers/admin/questionsController'

const router = express.Router()
const controller = new AdminQuestionsController()

router.get('/', adminAuthMiddleware, controller.getQuestions.bind(controller))
router.post('/', adminAuthMiddleware, controller.saveQuestions.bind(controller))

export default router
