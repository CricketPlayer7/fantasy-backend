import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminMatchesController } from '../../controllers/admin/matchesController'

const router = express.Router()
const controller = new AdminMatchesController()

router.get('/', adminAuthMiddleware, controller.getMatches.bind(controller))
router.post(
	'/',
	adminAuthMiddleware,
	controller.updateMatchAction.bind(controller)
)

export default router
