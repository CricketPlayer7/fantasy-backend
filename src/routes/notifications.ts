import express from 'express'
import { NotificationsController } from '../controllers/notificationsController'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()
const notificationsController = new NotificationsController()

// All notification routes require authentication
router.use(authMiddleware)

// GET /api/notifications - List notifications
router.get(
	'/',
	notificationsController.getNotifications.bind(notificationsController)
)

// PATCH /api/notifications/read - Mark as read
router.patch(
	'/read',
	notificationsController.markAsRead.bind(notificationsController)
)

// PATCH /api/notifications/clicked - Mark as clicked
router.patch(
	'/clicked',
	notificationsController.markAsClicked.bind(notificationsController)
)

// PATCH /api/notifications/bulk-action - Bulk update
router.patch(
	'/bulk-action',
	notificationsController.bulkUpdate.bind(notificationsController)
)

export default router
