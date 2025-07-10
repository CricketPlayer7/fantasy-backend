import { Request, Response } from 'express'
import { DevicesService } from '../services/devicesService'
import { deviceRegisterSchema } from '../validations'
import { AppError, asyncHandler } from '../utils/errorHandler'

export class DevicesController {
	private devicesService = new DevicesService()

	registerDevice = asyncHandler(async (req: Request, res: Response) => {
		// Validate device registration data
		const validationResult = deviceRegisterSchema.safeParse(req.body)
		if (!validationResult.success) {
			throw new AppError('Invalid device registration data', 400)
		}

		const { deviceToken, deviceType } = validationResult.data
		const userId = req.user.id

		// Register the device
		await this.devicesService.registerDevice(
			req.supabase,
			userId,
			deviceToken,
			deviceType
		)

		return res.json({
			success: true,
			message: 'Device registered successfully',
		})
	})

	removeDevice = asyncHandler(async (req: Request, res: Response) => {
		// Get token and userId from query parameters
		const { token, userId } = req.query

		if (!token || !userId) {
			throw new AppError('Missing token or userId parameters', 400)
		}

		// Remove the device (mark as inactive)
		await this.devicesService.removeDevice(
			req.supabase,
			String(userId),
			String(token)
		)

		return res.json({
			success: true,
			message: 'Device removed successfully',
		})
	})
}
