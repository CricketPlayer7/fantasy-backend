import express from 'express'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { NotificationsController } from '../../controllers/notificationsController'

const router = express.Router()
const notificationsController = new NotificationsController()

// POST /api/admin/notifications/send - Single notification
router.post(
	'/send',
	adminAuthMiddleware,
	notificationsController.sendNotification.bind(notificationsController)
)

// POST /api/admin/notifications/bulk - Bulk notification
router.post(
	'/bulk',
	adminAuthMiddleware,
	notificationsController.sendBulkNotification.bind(notificationsController)
)

export default router
