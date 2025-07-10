import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'

export class CouponsService {
	async applyCoupon(
		supabase: any,
		coupon_code: string,
		user_id: string,
		amount: number,
		usage_type: 'deposit' | 'league_entry',
		league_id?: number,
		match_id?: number
	) {
		try {
			// Apply coupon with PENDING status (default)
			const { data, error } = await supabase.rpc('apply_coupon', {
				p_coupon_code: coupon_code,
				p_user_id: user_id,
				p_amount: amount,
				p_usage_type: usage_type,
				p_transaction_id: null, // No transaction ID yet
				p_league_id: league_id,
				p_match_id: match_id,
				p_status: 'pending',
			})

			if (error) {
				logger.error('Database error when applying coupon:', {
					error: error.message,
					coupon_code,
					user_id,
				})
				throw new AppError(
					`Failed to apply coupon: ${error.message}`,
					500
				)
			}

			logger.info('Coupon applied:', {
				success: data.success,
				coupon_code,
				user_id,
				usage_type,
			})

			return data
		} catch (error) {
			logger.error('Error in applyCoupon service:', error)
			if (error instanceof AppError) {
				throw error
			}
			throw new AppError('Failed to apply coupon', 500)
		}
	}

	async getUserAvailableCoupons(supabase: any, user_id: string) {
		try {
			const { data, error } = await supabase.rpc(
				'get_user_available_coupons',
				{
					p_user_id: user_id,
				}
			)

			if (error) {
				logger.error(
					'Database error when fetching available coupons:',
					{
						error: error.message,
						user_id,
					}
				)
				throw new AppError(
					`Failed to fetch available coupons: ${error.message}`,
					500
				)
			}

			logger.info('User available coupons fetched successfully', {
				user_id,
				count: data?.length || 0,
			})

			return {
				success: true,
				data,
			}
		} catch (error) {
			logger.error('Error in getUserAvailableCoupons service:', error)
			if (error instanceof AppError) {
				throw error
			}
			throw new AppError('Failed to fetch available coupons', 500)
		}
	}
}
