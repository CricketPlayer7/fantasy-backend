import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'

interface Transaction {
	amount?: number
	transaction_type: string
}

interface CsvRow {
	[key: string]: any
}

export class AdminFinanceService {
	async getMonthlyStats(supabase: any, month: string) {
		const [year, monthNum] = month.split('-').map(Number)

		const startDate = new Date(year, monthNum - 1, 1)
		const endDate = new Date(year, monthNum, 0)

		const prevStartDate = new Date(year, monthNum - 2, 1)
		const prevEndDate = new Date(year, monthNum - 1, 0)

		const fetchTable = async (
			table: string,
			start: Date,
			end: Date,
			filters: Record<string, string> = {}
		): Promise<Transaction[]> => {
			let query = supabase
				.from(table)
				.select('amount, transaction_type')
				.gte('created_at', start.toISOString())
				.lte('created_at', end.toISOString())

			for (const [key, value] of Object.entries(filters)) {
				query = query.eq(key, value)
			}

			const { data, error } = await query
			if (error) {
				logger.error(`Error fetching ${table} data`, { error })
				throw new AppError(`Failed to fetch data from ${table}`, 500)
			}

			return data || []
		}

		// Fetch all required datasets
		const [
			currentTx,
			prevTx,
			currentBonus,
			prevBonus,
			currentWithdrawals,
			prevWithdrawals,
		] = await Promise.all([
			fetchTable('transactions', startDate, endDate),
			fetchTable('transactions', prevStartDate, prevEndDate),
			fetchTable('wallet_transactions', startDate, endDate, {
				transaction_type: 'bonus',
			}),
			fetchTable('wallet_transactions', prevStartDate, prevEndDate, {
				transaction_type: 'bonus',
			}),
			fetchTable('wallet_transactions', startDate, endDate, {
				transaction_type: 'withdraw',
				status: 'success',
			}),
			fetchTable('wallet_transactions', prevStartDate, prevEndDate, {
				transaction_type: 'withdraw',
			}),
		])

		const sumAmounts = (rows: Transaction[]) =>
			rows.reduce((sum, row) => sum + (row.amount || 0), 0)

		return {
			month,
			totalDeposits: sumAmounts(
				currentTx.filter((t) => t.transaction_type === 'credit')
			),
			totalWithdrawals: sumAmounts(currentWithdrawals),
			totalBonus: sumAmounts(currentBonus),
			previousMonthDeposits: sumAmounts(
				prevTx.filter((t) => t.transaction_type === 'credit')
			),
			previousMonthWithdrawals: sumAmounts(prevWithdrawals),
			previousMonthBonus: sumAmounts(prevBonus),
		}
	}

	async exportGstData(supabase: any, fromDate: string, toDate: string) {
		const { data, error } = await supabase
			.from('gst')
			.select(
				'id, created_at, user_id, transaction_id, amount, gst_percentage, gst_amount'
			)
			.gte('created_at', fromDate)
			.lte('created_at', toDate)
			.order('created_at', { ascending: false })

		if (error) {
			logger.error('Failed to fetch GST export data', { error })
			throw new AppError('Failed to export GST data', 500)
		}

		const headers = [
			'id',
			'created_at',
			'user_id',
			'transaction_id',
			'amount',
			'gst_percentage',
			'gst_amount',
		]

		const csvRows: string[] = [headers.join(',')]

		for (const row of (data || []) as CsvRow[]) {
			const values = headers.map((key) => {
				const val = row[key]
				return typeof val === 'string' && val.includes(',')
					? `"${val}"`
					: val
			})
			csvRows.push(values.join(','))
		}

		return {
			csv: csvRows.join('\n'),
			filename: `gst_export_${fromDate}_to_${toDate}.csv`,
		}
	}
}
