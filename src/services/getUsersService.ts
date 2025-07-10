import { AppError } from '../utils/errorHandler'
import { logger } from '../utils/logger'
import { 
  DatabaseUser, 
  DatabaseTransaction, 
  DatabaseWalletTransaction, 
  DatabaseKyc,
  GetUsersQuery,
  UserWithStats,
  GetUsersResult,
  UserStats
} from '../types'

export class GetUsersService {
  async getUsers(supabaseAdmin: any, query: GetUsersQuery): Promise<GetUsersResult> {
    try {
      const {
        page = 1,
        limit = 50,
        search,
        status,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = query

      // Calculate offset
      const offset = (page - 1) * limit

      // Get users from Supabase Auth
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: limit
      })

      if (authError) {
        logger.error('Error fetching auth users:', authError)
        throw new AppError('Failed to fetch users', 500)
      }

      let filteredUsers = authUsers.users || []

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase()
        filteredUsers = filteredUsers.filter((user: any) => 
          user.email?.toLowerCase().includes(searchLower) ||
          user.user_metadata?.full_name?.toLowerCase().includes(searchLower) ||
          user.id.toLowerCase().includes(searchLower)
        )
      }

      // Apply status filter
      if (status) {
        filteredUsers = filteredUsers.filter((user: any) => {
          switch (status) {
            case 'active':
              return !user.banned_until && user.email_confirmed_at
            case 'banned':
              return user.banned_until && new Date(user.banned_until) > new Date()
            case 'pending':
              return !user.email_confirmed_at
            default:
              return true
          }
        })
      }

      // Get user IDs for additional data
      const userIds = filteredUsers.map((user: any) => user.id)

      // Get user deposits
      const { data: deposits } = await supabaseAdmin
        .from('transactions')
        .select('user_id, amount')
        .eq('transaction_type', 'credit')
        .in('user_id', userIds)

      // Get user withdrawals
      const { data: withdrawals } = await supabaseAdmin
        .from('wallet_transactions')
        .select('user_id, amount')
        .eq('transaction_type', 'withdraw')
        .eq('status', 'success')
        .in('user_id', userIds)

      // Get wallet balances
      const { data: wallets } = await supabaseAdmin
        .from('wallets')
        .select('user_id, balance')
        .in('user_id', userIds)

      // Get KYC status
      const { data: kycData } = await supabaseAdmin
        .from('kyc')
        .select('user_id, status')
        .in('user_id', userIds)

      // Process and combine data
      const usersWithStats: UserWithStats[] = filteredUsers.map((user: any) => {
        const userDeposits = deposits?.filter((d: any) => d.user_id === user.id) || []
        const userWithdrawals = withdrawals?.filter((w: any) => w.user_id === user.id) || []
        const userWallet = wallets?.find((w: any) => w.user_id === user.id)
        const userKyc = kycData?.find((k: any) => k.user_id === user.id)

        const totalDeposits = userDeposits.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)
        const totalWithdrawals = userWithdrawals.reduce((sum: number, w: any) => sum + (w.amount || 0), 0)

        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          banned_until: user.banned_until,
          user_metadata: user.user_metadata,
          totalDeposits,
          totalWithdrawals,
          walletBalance: userWallet?.balance || 0,
          kycStatus: userKyc?.status || 'not_submitted',
          isActive: !user.banned_until && user.email_confirmed_at
        }
      })

      // Sort users
      usersWithStats.sort((a, b) => {
        let aValue, bValue
        
        switch (sortBy) {
          case 'email':
            aValue = a.email
            bValue = b.email
            break
          case 'last_sign_in_at':
            aValue = a.last_sign_in_at
            bValue = b.last_sign_in_at
            break
          case 'created_at':
          default:
            aValue = a.created_at
            bValue = b.created_at
            break
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })

      // Calculate total for pagination
      const total = filteredUsers.length
      const totalPages = Math.ceil(total / limit)

      return {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error) {
      logger.error('Error in getUsers:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to fetch users', 500)
    }
  }

  async getUserStats(supabaseAdmin: any): Promise<UserStats> {
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
        .from('transactions')
        .select('amount')
        .eq('transaction_type', 'debit')
        .gte('created_at', startOfMonth.toISOString())

      // Get pending KYC
      const { data: pendingKyc, error: kycError } = await supabaseAdmin
        .from('kyc')
        .select('*')
        .eq('status', 'pending')

      if (usersError || newUsersError || depositsError || lastMonthDepositsError || withdrawalsError || kycError) {
        logger.error('Error fetching user stats:', {
          usersError,
          newUsersError,
          depositsError,
          lastMonthDepositsError,
          withdrawalsError,
          kycError
        })
        throw new AppError('Error fetching user statistics', 500)
      }

      // Calculate totals
      const totalDeposits = currentMonthDeposits?.reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0
      const lastMonthTotalDeposits = lastMonthDeposits?.reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0
      const totalWithdrawals = currentMonthWithdrawals?.reduce((sum: number, t: DatabaseTransaction) => sum + (t.amount || 0), 0) || 0

      return {
        totalUsers: users?.users.length || 0,
        newUsersThisMonth: newUsers?.length || 0,
        currentMonthDeposits: totalDeposits,
        lastMonthDeposits: lastMonthTotalDeposits,
        currentMonthWithdrawals: totalWithdrawals,
        pendingKyc: pendingKyc?.length || 0
      }
    } catch (error) {
      logger.error('Error in getUserStats:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to fetch user statistics', 500)
    }
  }
}
