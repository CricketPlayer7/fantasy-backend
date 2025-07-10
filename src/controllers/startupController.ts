import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { notificationListener } from '../utils/notifications/notificationListener'

let isListenerStarted = false

export class StartupController {
	start = asyncHandler(async (req: Request, res: Response) => {
		if (!isListenerStarted) {
			await notificationListener.start()
			isListenerStarted = true
		}

		res.json({
			success: true,
			message: 'Notification listener started',
		})
	})
}
