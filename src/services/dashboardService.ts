import { AppError } from '../utils/errorHandler'
import { logger } from '../utils/logger'
import { DashboardData, DatabaseUser, DatabaseTransaction, DatabaseWalletTransaction, DatabaseKyc } from '../types'

export class DashboardService {
  async getDashboardData(supabaseAdmin: any): Promise<DashboardData> {
    try {
      // Get total users
      const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

      // Get this month's new users
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: newUsers, error: newUsersError } = await supabaseAdmin
        .from('users')
        .select('created_at')
        .gte('created_at', startOfMonth.toISOString())

      // Get deposits for current and last month
      const startOfLastMonth = new Date(startOfMonth)
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

      const { data: currentMonthDeposits, error: depositsError } = await supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('transaction_type', 'credit')
        .gte('created_at', startOfMonth.toISOString())

      const { data: lastMonthDeposits, error: lastMonthDepositsError } = await supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('transaction_type', 'credit')
        .gte('created_at', startOfLastMonth.toISOString())
        .lt('created_at', startOfMonth.toISOString())

      // Get withdrawals for current month
      const { data: currentMonthWithdrawals, error: withdrawalsError } = await supabaseAdmin
        .from('wallet_transactions')
        .select('amount')
        .eq('transaction_type', 'withdraw')
        .eq('status', 'success')
        .gte('created_at', startOfMonth.toISOString())

      // Get pending KYC
      const { data: pendingKyc, error: kycError } = await supabaseAdmin
        .from('kyc')
        .select('*')
        .eq('status', 'pending')

      // Get daily user registrations for the last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: dailyUsers, error: dailyUsersError } = await supabaseAdmin
        .from('users')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      // Get daily transactions for the last 7 days
      const { data: dailyTransactions, error: dailyTransactionsError } = await supabaseAdmin
        .from('transactions')
        .select('amount, created_at, transaction_type')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      // Get monthly stats for the last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: monthlyData, error: monthlyDataError } = await supabaseAdmin
        .from('transactions')
        .select('amount, created_at, transaction_type')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      // Check for errors
      if (usersError || newUsersError || depositsError || lastMonthDepositsError || 
          withdrawalsError || kycError || dailyUsersError || dailyTransactionsError || monthlyDataError) {
        logger.error('Error fetching dashboard data', {
          usersError,
          newUsersError,
          depositsError,
          lastMonthDepositsError,
          withdrawalsError,
          kycError,
          dailyUsersError,
          dailyTransactionsError,
          monthlyDataError
        })
        throw new AppError('Error fetching dashboard data', 500)
      }

      // Calculate totals
      const totalDeposits = currentMonthDeposits?.reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0
      const lastMonthTotalDeposits = lastMonthDeposits?.reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0
      const totalWithdrawals = currentMonthWithdrawals?.reduce((sum: number, t: DatabaseWalletTransaction) => sum + (t.amount || 0), 0) || 0

      // Process daily user data
      const dailyUserStats = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const usersOnDate = dailyUsers?.filter((user: DatabaseUser) => 
          user.created_at.startsWith(dateStr)
        ).length || 0
        
        dailyUserStats.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          users: usersOnDate
        })
      }

      // Process daily transaction data
      const dailyTransactionStats = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const depositsOnDate = dailyTransactions?.filter((t: DatabaseTransaction) => 
          t.created_at.startsWith(dateStr) && t.transaction_type === 'credit'
        ).reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0
        
        const withdrawalsOnDate = dailyTransactions?.filter((t: DatabaseTransaction) => 
          t.created_at.startsWith(dateStr) && t.transaction_type === 'debit'
        ).reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0
        
        dailyTransactionStats.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          deposits: depositsOnDate,
          withdrawals: withdrawalsOnDate
        })
      }

      // Process monthly data for the last 6 months
      const monthlyStats = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const month = date.getMonth()
        const year = date.getFullYear()
        
        const monthlyDeposits = monthlyData?.filter((t: DatabaseTransaction) => {
          const tDate = new Date(t.created_at)
          return tDate.getMonth() === month && 
                 tDate.getFullYear() === year && 
                 t.transaction_type === 'credit'
        }).reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0
        
        const monthlyWithdrawals = monthlyData?.filter((t: DatabaseTransaction) => {
          const tDate = new Date(t.created_at)
          return tDate.getMonth() === month && 
                 tDate.getFullYear() === year && 
                 t.transaction_type === 'debit'
        }).reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0
        
        monthlyStats.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          deposits: monthlyDeposits,
          withdrawals: monthlyWithdrawals
        })
      }

      return {
        totalUsers: users?.users.length || 0,
        newUsersThisMonth: newUsers?.length || 0,
        currentMonthDeposits: totalDeposits,
        lastMonthDeposits: lastMonthTotalDeposits,
        currentMonthWithdrawals: totalWithdrawals,
        pendingKyc: pendingKyc?.length || 0,
        dailyUserStats,
        dailyTransactionStats,
        monthlyStats
      }
    } catch (error) {
      logger.error('Error in getDashboardData:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to fetch dashboard data', 500)
    }
  }
}
