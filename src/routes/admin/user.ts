import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminUserController } from '../../controllers/admin/userController'

const router = express.Router()
const controller = new AdminUserController()

router.get('/', adminAuthMiddleware, controller.getUsers.bind(controller))
router.post('/ban', adminAuthMiddleware, controller.banUser.bind(controller))
router.post(
	'/wallet',
	adminAuthMiddleware,
	controller.addWalletBonus.bind(controller)
)

export default router
