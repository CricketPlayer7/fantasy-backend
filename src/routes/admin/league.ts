import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminLeagueController } from '../../controllers/admin/leagueController'

const router = express.Router()
const controller = new AdminLeagueController()

router.get('/', adminAuthMiddleware, controller.getAllLeagues)
router.post('/', adminAuthMiddleware, controller.updateLeague)

export default router
