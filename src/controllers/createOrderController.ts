import { Request, Response } from 'express'
import { CreateOrderService } from '../services/createOrderService'
import { createOrderSchema } from '../validations'
import { asyncHandler, AppError } from '../utils/errorHandler'
import { logger } from '../utils/logger'
import { CreateOrderData } from '@/types'

export class CreateOrderController {
  private createOrderService = new CreateOrderService()

  createOrder = asyncHandler(async (req: Request, res: Response) => {
    // Validate order data
    const validationResult = createOrderSchema.safeParse(req.body)
    if (!validationResult.success) {
      throw new AppError('Invalid order data', 400)
    }

    // Create a properly typed order data object
    const orderData: CreateOrderData = {
      ...validationResult.data,
      user_id: req.user.id // Ensure user_id is always defined
    }
    
    // Create the order
    const order = await this.createOrderService.createOrder(
      req.supabase,
      orderData
    )

    return res.json(order)
  })
}