import Razorpay from 'razorpay'
import { config } from '../config'
import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'
import { CreateOrderData } from '../types'

export class CreateOrderService {
  private razorpay: Razorpay

  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.razorpay.keyId!,
      key_secret: config.razorpay.keySecret!,
    })
  }

  async createOrder(supabase: any, orderData: CreateOrderData) {
    try {
      const {
        amount,
        user_name,
        user_id,
        coupon_id,
        coupon_code,
        original_amount,
        final_amount,
        discount_applied,
        usage_id
      } = orderData

      // Create Razorpay order
      const options = {
        amount: (final_amount || amount) * 100, // Use final_amount (after discount) for Razorpay
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1, // Enable auto-capture
        notes: {
          user_name,
          user_id,
          transaction_type: 'deposit',
          original_amount: original_amount || amount,
          final_amount: final_amount || amount,
          discount_amount: discount_applied || 0,
          coupon_id: coupon_id || null,
          coupon_code: coupon_code || null,
          usage_id: usage_id || null
        }
      }

      const order = await this.razorpay.orders.create(options)
      const now = new Date().toISOString()

      // Create transaction record in database
      const transactionData = {
        transaction_id: null, // Razorpay order ID will be updated later
        order_id: order.id,
        user_id,
        user_name,
        razorpay_status: 'created',
        app_status: 'pending',
        amount: final_amount || amount, // Store final amount after discount
        original_amount: original_amount || amount,
        discount_amount: discount_applied || 0,
        payment_mode: 'razorpay',
        created_at: now,
        date: now,
        transaction_type: 'deposit',
        coupon_id: coupon_id || null,
        coupon_code: coupon_code || null,
        usage_id: usage_id || null
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)

      if (transactionError) {
        logger.error('Error creating transaction record:', transactionError)
        throw new AppError('Error creating transaction record', 500)
      }

      logger.info('Order created successfully:', { 
        order_id: order.id,
        user_id
      })

      // Return order data with additional fields
      return {
        ...order,
        coupon_applied: !!coupon_code,
        original_amount: original_amount || amount,
        final_amount: final_amount || amount,
        discount_amount: discount_applied || 0
      }

    } catch (error) {
      logger.error('Error in createOrder service:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to create order',
        500
      )
    }
  }
}