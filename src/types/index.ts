export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface User {
  id: string
  email: string
  [key: string]: any
}

export interface AuthConfirmQuery {
  token_hash?: string
  type?: string
}

export interface SentimentQuery {
  league_id?: string
  match_id?: string
  question_id?: string
}

export interface SentimentResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export interface MulterFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

export interface CreateOrderData {
  amount: number
  user_name: string
  user_id: string
  coupon_id?: string | null
  coupon_code?: string | null
  original_amount?: number | null
  final_amount?: number | null
  discount_applied?: number | null
  usage_id?: string | null
}

export interface CricketAnswersQuery {
  league_id?: string
}

export interface UserAnswer {
  user_id: string
  league_id: string
  match_id: string
  question_id: string
  answer: string
  entry_id: string
  ref_entry_id: string
  [key: string]: any // Allow for any additional properties
}

export interface CricketLeaderboardQuery {
  match_id?: string
  league_id?: string
  type?: string
  limit?: string
  offset?: string
}

export interface MatchInfo {
  series_name: string
  status: string
  match_format: string
  venue: string
}

export interface LeagueInfo {
  name: string
  entry_fee: number
  prize: number
  no_of_questions: number
}

export interface CricketLeagueQuery {
  league_id?: string
  match_id?: string
}

export interface League {
  league_id: number
  name: string
  description?: string
  entry_fee: number
  prize: number
  no_of_questions: number
  start_date: string
  end_date: string
  enabled: boolean
  created_at: string
  updated_at: string
  [key: string]: any
}

export interface CricketMatchesListBody {
  series_type?: string
  series_id?: string
  match_type?: 'live' | 'complete' | 'upcoming'
}

export interface PaginationQuery {
  itemsPerPage: number
  pageIndex: number
}

export interface Match {
  id: string
  series_type: string
  series_id: string
  match_state: string
  start: number
  is_match_enabled: boolean
  [key: string]: any
}

export interface PaginationMetadata {
  pageIndex: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
}

export interface CricketMatchesListResponse {
  data: Match[]
  pagination: PaginationMetadata
}

export interface CricketMatchRequest {
  match_id: string | number
}

export interface ScorecardRequest {
  match_id: string | number
}

export interface Gender {
  id: number
  name: string
  [key: string]: any
}

export interface UserActivityRequest {
  activity_type: string
}

export interface UserActivityLog {
  current_streak: number
  last_activity_date: string
  total_active_days: number
  longest_streak: number
  streak_start_date: string
  [key: string]: any
}

export interface UserMetaUpdate {
  full_name?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  city?: string
  pincode?: number
  state?: string
}

export interface UserMeta {
  user_id: string
  full_name: string
  gender: string
  address: string
  city: string
  pincode: number
  state: string
  [key: string]: any
}

export interface WalletTransactionRequest {
  user_id?: string
  transaction_type?: string
  date?: string
  status?: string
  limit?: number
  offset?: number
}

export interface TdsRequest {
  user_id?: string
  date?: string
  limit?: number
  offset?: number
}

export interface GamificationQuery {
  type?: string
}

export interface BadgeProgressQuery {
  progress?: string
  stats?: string
  rarity?: string
  category?: string
}

export interface PredictionResultsQuery {
  match_id: string
  league_id?: string
}

export interface TierProgressQuery {
  progression?: string
  stats?: string
}

export interface NotificationsListQuery {
  userId?: string
  page?: string
  limit?: string
  unread?: string
}

export interface NotificationReadQuery {
  id?: string
  userId?: string
}

export interface NotificationClickedQuery {
  id?: string
}

export interface NotificationBulkAction {
  action: string
  notificationIds?: string[]
}

export interface DashboardData {
  totalUsers: number
  newUsersThisMonth: number
  currentMonthDeposits: number
  lastMonthDeposits: number
  currentMonthWithdrawals: number
  pendingKyc: number
  dailyUserStats: Array<{
    date: string
    users: number
  }>
  dailyTransactionStats: Array<{
    date: string
    deposits: number
    withdrawals: number
  }>
  monthlyStats: Array<{
    month: string
    deposits: number
    withdrawals: number
  }>
}

export interface DatabaseUser {
  id: string
  created_at: string
  [key: string]: any
}

export interface DatabaseTransaction {
  id: string
  amount: number
  transaction_type: 'credit' | 'debit'
  created_at: string
  [key: string]: any
}

export interface DatabaseWalletTransaction {
  id: string
  amount: number
  transaction_type: 'withdraw' | 'deposit'
  status: 'success' | 'pending' | 'failed'
  created_at: string
  [key: string]: any
}

export interface DatabaseKyc {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  [key: string]: any
}

export interface GetUsersQuery {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'banned' | 'pending'
  sortBy?: 'created_at' | 'email' | 'last_sign_in_at'
  sortOrder?: 'asc' | 'desc'
}

export interface UserWithStats {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  email_confirmed_at: string
  banned_until?: string
  user_metadata: any
  totalDeposits: number
  totalWithdrawals: number
  walletBalance: number
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  isActive: boolean
}

export interface GetUsersResult {
  users: UserWithStats[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UserStats {
  totalUsers: number
  newUsersThisMonth: number
  currentMonthDeposits: number
  lastMonthDeposits: number
  currentMonthWithdrawals: number
  pendingKyc: number
}