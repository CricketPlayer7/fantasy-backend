import { Request, Response } from 'express'
import { DevicesService } from '../services/devicesService'
import { deviceRegisterSchema } from '../validations'
import { logger } from '../utils/logger'
import { asyncHandler } from '../utils/errorHandler'

export class DevicesController {
  private devicesService = new DevicesService()

  registerDevice = asyncHandler(async (req: Request, res: Response) => {
    // Validate device registration data
    const validationResult = deviceRegisterSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid device registration data',
        details: validationResult.error.format(),
      })
    }

    const { deviceToken, deviceType } = validationResult.data
    const userId = req.user.id

    // Register the device
    const result = await this.devicesService.registerDevice(
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
}