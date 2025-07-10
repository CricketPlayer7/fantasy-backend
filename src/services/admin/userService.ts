import { AppError } from '../../utils/errorHandler'
import { AdminUsersQuery } from '../../types'

export class AdminUserService {
	async getUsers(supabase: any, page: number, perPage: number, showBots: boolean = false) {
		const offset = (page - 1) * perPage

		let query = supabase
			.from('users_with_auth')
			.select('*', { count: 'exact' })
			.range(offset, offset + perPage - 1)
			.order('meta_created_at', { ascending: false })

		// Filter out bots by default (when showBots is false)
		if (!showBots) {
			query = query.eq('auth_is_bot', false)
		}

		const {
			data: users,
			error,
			count,
		} = await query

		if (error) throw new AppError('Failed to fetch users', 500)

		return {
			users,
			pagination: {
				currentPage: page,
				perPage,
				totalUsers: count || 0,
				totalPages: Math.ceil((count || 0) / perPage),
			},
		}
	}

	async banUser(supabase: any, user_id: string, ban: boolean) {
		const banDuration = ban
			? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
			: null

		const { error } = await supabase.auth.admin.updateUserById(user_id, {
			ban_duration: banDuration,
		})

		if (error) throw new AppError('Failed to update user ban', 500)
	}

	async addWalletBonus(supabase: any, user_id: string, amount: number) {
		const { error: txError } = await supabase
			.from('wallet_transactions')
			.insert({
				user_id,
				amount,
				status: 'success',
				transaction_type: 'bonus',
			})

		if (txError)
			throw new AppError('Failed to insert wallet transaction', 500)

		const { error: walletError } = await supabase.rpc(
			'update_wallet_balance',
			{
				p_user_id: user_id,
				p_amount: amount,
			}
		)

		if (walletError) throw new AppError('Failed to update wallet', 500)
	}
}
