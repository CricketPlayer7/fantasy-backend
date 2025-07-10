import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'

export class DevicesService {
  async registerDevice(
    supabase: any,
    userId: string,
    deviceToken: string,
    deviceType: string = 'android'
  ) {
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
        success: true,
      }
    } catch (error) {
      logger.error('Error in registerDevice service:', error)
      throw error
    }
  }
}