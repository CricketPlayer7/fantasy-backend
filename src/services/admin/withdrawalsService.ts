import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { SupabaseClient } from '@supabase/supabase-js'
import { WithdrawalApproval, WithdrawalStats } from '../../types'

export class AdminWithdrawalsService {
	async getAllWithdrawals(
		supabase: SupabaseClient
	): Promise<WithdrawalApproval[]> {
		const { data, error } = await supabase
			.from('withdrawal_approval')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) {
			logger.error('Error fetching withdrawals', { error })
			throw new AppError('Failed to fetch withdrawals', 500)
		}

		return data as WithdrawalApproval[]
	}

	async approveWithdrawal(
		supabase: SupabaseClient,
		withdrawal_id: string,
		user_id: string,
		amount: number
	): Promise<void> {
		const { error: withdrawalError } = await supabase
			.from('withdrawal_approval')
			.update({ status: 'success' })
			.eq('id', withdrawal_id)

		if (withdrawalError) {
			logger.error('Error updating withdrawal', {
				withdrawal_id,
				withdrawalError,
			})
			throw new AppError('Failed to update withdrawal status', 500)
		}

		const { error: txnError } = await supabase
			.from('wallet_transactions')
			.update({
				status: 'success',
				updated_at: new Date().toISOString(),
			})
			.eq('user_id', user_id)
			.eq('amount', amount)
			.eq('transaction_type', 'withdraw')
			.eq('status', 'pending')

		if (txnError) {
			logger.error('Error updating wallet transaction', {
				user_id,
				txnError,
			})
			throw new AppError('Failed to update wallet transaction', 500)
		}
	}

	async getMonthlyStats(supabase: SupabaseClient): Promise<WithdrawalStats> {
		const current = new Date()
		const firstOfMonth = new Date(
			current.getFullYear(),
			current.getMonth(),
			1
		)
		const firstOfPrevMonth = new Date(
			current.getFullYear(),
			current.getMonth() - 1,
			1
		)

		const [currRes, prevRes] = await Promise.all([
			supabase
				.from('withdrawal_approval')
				.select('status')
				.gte('created_at', firstOfMonth.toISOString()),
			supabase
				.from('withdrawal_approval')
				.select('status')
				.gte('created_at', firstOfPrevMonth.toISOString())
				.lt('created_at', firstOfMonth.toISOString()),
		])

		if (currRes.error || prevRes.error) {
			logger.error('Error fetching withdrawal stats', {
				currRes,
				prevRes,
			})
			throw new AppError('Failed to fetch withdrawal stats', 500)
		}

		const totalPending = (currRes.data || []).filter(
			(w) => w.status === 'pending'
		).length
		const totalApproved = (currRes.data || []).filter(
			(w) => w.status === 'success'
		).length
		const previousPending = (prevRes.data || []).filter(
			(w) => w.status === 'pending'
		).length
		const previousApproved = (prevRes.data || []).filter(
			(w) => w.status === 'success'
		).length

		return {
			totalPending,
			totalApproved,
			previousMonthPending: previousPending,
			previousMonthApproved: previousApproved,
		}
	}
}
