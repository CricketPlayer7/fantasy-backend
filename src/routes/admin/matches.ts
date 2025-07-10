import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminMatchesController } from '../../controllers/admin/matchesController'

const router = express.Router()
const controller = new AdminMatchesController()

router.get('/', adminAuthMiddleware, controller.getMatches)
router.post('/', adminAuthMiddleware, controller.updateMatchAction)

export default router
