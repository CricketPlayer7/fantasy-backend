import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'

interface DeviceRegistrationResult {
	success: boolean
	error?: string
}

export class DevicesService {
	async registerDevice(
		supabase: any,
		userId: string,
		deviceToken: string,
		deviceType: string = 'android'
	): Promise<DeviceRegistrationResult> {
		try {
			// Upsert device token
			const { error } = await supabase.from('user_devices').upsert(
				{
					user_id: userId,
					device_token: deviceToken,
					device_type: deviceType,
					is_active: true,
				},
				{
					onConflict: 'device_token',
				}
			)

			if (error) {
				logger.error('Database error when registering device:', {
					error: error.message,
					userId,
					deviceType,
				})
				throw new AppError(`Failed to register device: ${error.message}`, 500)
			}

			logger.info('Device registered successfully:', {
				userId,
				deviceType,
			})

			return {
				success: true
			}
		} catch (error) {
			logger.error('Error in registerDevice service:', error)
			if (error instanceof AppError) {
				throw error
			}
			throw new AppError('Failed to register device', 500)
		}
	}

	async removeDevice(
		supabase: any,
		userId: string,
		deviceToken: string
	): Promise<void> {
		try {
			// Update device to mark as inactive
			const { error } = await supabase
				.from('user_devices')
				.update({ is_active: false })
				.eq('device_token', deviceToken)
				.eq('user_id', userId)

			if (error) {
				logger.error('Database error when removing device:', {
					error: error.message,
					userId,
					deviceToken,
				})
				throw new AppError(`Failed to remove device: ${error.message}`, 500)
			}

			logger.info('Device removed successfully:', {
				userId,
				deviceToken,
			})
		} catch (error) {
			logger.error('Error in removeDevice service:', error)
			if (error instanceof AppError) {
				throw error
			}
			throw new AppError('Failed to remove device', 500)
		}
	}
}
