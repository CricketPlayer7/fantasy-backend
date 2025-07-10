import express from 'express'
import { NotificationsController } from '../controllers/notificationsController'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()
const notificationsController = new NotificationsController()

// GET /api/notifications - List notifications
router.get(
	'/',
	authMiddleware,
	notificationsController.getNotifications.bind(notificationsController)
)

// PATCH /api/notifications/read - Mark as read
router.patch(
	'/read',
	authMiddleware,
	notificationsController.markAsRead.bind(notificationsController)
)

// PATCH /api/notifications/clicked - Mark as clicked
router.patch(
	'/clicked',
	authMiddleware,
	notificationsController.markAsClicked.bind(notificationsController)
)

// PATCH /api/notifications/bulk-action - Bulk update
router.patch(
	'/bulk-action',
	authMiddleware,
	notificationsController.bulkUpdate.bind(notificationsController)
)

// GET /api/notifications/preferences - Get notification preferences
router.get(
	'/preferences',
	authMiddleware,
	notificationsController.getNotificationPreferences.bind(notificationsController)
)

// PUT /api/notifications/preferences - Update notification preferences
router.put(
	'/preferences',
	authMiddleware,
	notificationsController.updateNotificationPreferences.bind(notificationsController)
)

export default router
