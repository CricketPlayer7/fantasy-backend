import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { AdminGstController } from '../../controllers/admin/gstController'

const router = express.Router()
const controller = new AdminGstController()

router.get(
	'/',
	adminAuthMiddleware,
	controller.getPaginatedGst.bind(controller)
)

export default router
