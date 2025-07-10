import { Request, Response } from 'express'
import { NotificationsService } from '../services/notificationsService'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { notificationBulkActionSchema } from '../validations'

export class NotificationsController {
	getNotifications = asyncHandler(async (req: Request, res: Response) => {
		const userId = req.query.userId as string
		const page = parseInt((req.query.page as string) || '1')
		const limit = parseInt((req.query.limit as string) || '20')
		const unread = req.query.unread === 'true'

		if (!userId) {
			throw new AppError('User ID required', 400)
		}

		const notificationsService = new NotificationsService(req.supabase)
		const result = await notificationsService.getNotifications(userId, page, limit, unread)

		res.json(result)
	})

	markAsRead = asyncHandler(async (req: Request, res: Response) => {
		const notificationId = req.query.id as string
		const userId = req.query.userId as string

		if (!notificationId || !userId) {
			throw new AppError('Missing notification ID or user ID', 400)
		}

		const notificationsService = new NotificationsService(req.supabase)
		const result = await notificationsService.markAsRead(notificationId, userId)

		res.json(result)
	})

	markAsClicked = asyncHandler(async (req: Request, res: Response) => {
		const notificationId = req.query.id as string

		if (!notificationId) {
			throw new AppError('Notification ID required', 400)
		}

		const notificationsService = new NotificationsService(req.supabase)
		const result = await notificationsService.markAsClicked(notificationId)

		res.json(result)
	})

	bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
		// Validate request body
		const validation = notificationBulkActionSchema.safeParse(req.body)
		if (!validation.success) {
			throw new AppError('Invalid request body', 400)
		}

		const { action, notificationIds } = validation.data
		const userId = req.user.id // Get from authenticated user

		const notificationsService = new NotificationsService(req.supabase)
		const result = await notificationsService.bulkUpdate(userId, action, notificationIds)

		res.json(result)
	})
}
