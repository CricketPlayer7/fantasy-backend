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

// No need to extend Express Request interface for multer 2.x
// as the types are already properly defined in @types/multer