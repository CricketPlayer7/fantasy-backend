import { Request, Response } from 'express'
import { NotificationsService } from '../services/notificationsService'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { 
	notificationBulkActionSchema, 
	sendNotificationSchema,
	sendBulkNotificationSchema,
	updateNotificationPreferencesSchema
} from '../validations'
import { logger } from '../utils/logger'

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

	// Admin only - Send notification
	sendNotification = asyncHandler(async (req: Request, res: Response) => {
		logger.info('Admin sending notification', { 
			adminId: req.user?.id,
			body: req.body 
		})

		// Validate request body
		const validation = sendNotificationSchema.safeParse(req.body)
		if (!validation.success) {
			logger.warn('Invalid notification data', { 
				adminId: req.user?.id,
				errors: validation.error.format()
			})
			throw new AppError('Invalid notification data', 400)
		}

		const notificationData = validation.data

		const notificationsService = new NotificationsService(req.supabase)
		const notification = await notificationsService.sendNotification(req.supabaseAdmin, notificationData)

		res.json({
			success: true,
			data: notification,
			message: 'Notification sent successfully'
		})
	})

	// Admin only - Send bulk notification
	sendBulkNotification = asyncHandler(async (req: Request, res: Response) => {
		logger.info('Admin sending bulk notification', { 
			adminId: req.user?.id,
			body: req.body 
		})

		// Validate request body
		const validation = sendBulkNotificationSchema.safeParse(req.body)
		if (!validation.success) {
			logger.warn('Invalid bulk notification data', { 
				adminId: req.user?.id,
				errors: validation.error.format()
			})
			throw new AppError('Invalid bulk notification data', 400)
		}

		const bulkData = validation.data

		const notificationsService = new NotificationsService(req.supabase)
		const result = await notificationsService.sendBulkNotification(req.supabaseAdmin, bulkData)

		res.json({
			success: true,
			data: result,
			message: `Bulk notification completed. Sent to ${result.sent_count} users.`
		})
	})

	// Get notification preferences
	getNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
		const userId = req.query.userId as string

		if (!userId) {
			throw new AppError('User ID required', 400)
		}

		logger.info('Fetching notification preferences', { userId, requesterId: req.user?.id })

		const notificationsService = new NotificationsService(req.supabase)
		const preferences = await notificationsService.getNotificationPreferences(userId)

		res.json({
			success: true,
			data: preferences
		})
	})

	// Update notification preferences
	updateNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
		logger.info('Updating notification preferences', { 
			requesterId: req.user?.id,
			body: req.body 
		})

		// Validate request body
		const validation = updateNotificationPreferencesSchema.safeParse(req.body)
		if (!validation.success) {
			logger.warn('Invalid notification preferences data', { 
				requesterId: req.user?.id,
				errors: validation.error.format()
			})
			throw new AppError('Invalid notification preferences data', 400)
		}

		const preferencesData = validation.data

		const notificationsService = new NotificationsService(req.supabase)
		const result = await notificationsService.updateNotificationPreferences(preferencesData)

		res.json({
			success: true,
			data: result,
			message: 'Notification preferences updated successfully'
		})
	})
}
