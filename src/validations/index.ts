import { z } from 'zod'

export const authConfirmSchema = z.object({
  token_hash: z.string().min(1, 'Token hash is required'),
  type: z.enum(['signup', 'email_change', 'recovery', 'invite'], {
    errorMap: () => ({ message: 'Invalid OTP type' })
  })
})

export const sentimentQuerySchema = z.object({
  league_id: z.string().regex(/^\d+$/, 'League ID must be a number'),
  match_id: z.string().regex(/^\d+$/, 'Match ID must be a number'),
  question_id: z.string().regex(/^\d+$/, 'Question ID must be a number').optional()
})

export const applyCouponSchema = z.object({
  coupon_code: z.string().min(3).max(50),
  amount: z.number().positive(),
  usage_type: z.enum(['deposit', 'league_entry']),
  league_id: z.number().int().positive().optional(),
  match_id: z.number().int().positive().optional()
})

export const deviceRegisterSchema = z.object({
  deviceToken: z.string().min(1, 'Device token is required'),
  deviceType: z.enum(['android', 'ios', 'web']).default('android')
})

export const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  user_name: z.string().min(1, 'User name is required'),
  user_id: z.string().optional(),  // Will be added from the authenticated user
  coupon_id: z.string().optional().nullable(),
  coupon_code: z.string().optional().nullable(),
  original_amount: z.number().positive().optional().nullable(),
  final_amount: z.number().positive().optional().nullable(),
  discount_applied: z.number().min(0).optional().nullable(),
  usage_id: z.string().optional().nullable()
})

export const cricketAnswersQuerySchema = z.object({
  league_id: z.string().regex(/^\d+$/, 'League ID must be a number')
})

export const cricketLeaderboardQuerySchema = z.object({
  match_id: z.string().regex(/^\d+$/, 'Match ID must be a number'),
  league_id: z.string().regex(/^\d+$/, 'League ID must be a number').optional(),
  type: z.enum(['match', 'league']).default('league'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').default('50').transform(Number),
  offset: z.string().regex(/^\d+$/, 'Offset must be a number').default('0').transform(Number)
}).refine(data => {
  if (data.type === 'league' && !data.league_id) {
    return false;
  }
  return true;
}, {
  message: 'league_id is required when type is "league"',
  path: ['league_id']
})

export const cricketLeagueParticipantsCountSchema = z.object({
  match_id: z.string().regex(/^\d+$/, 'Match ID must be a number'),
  league_id: z.string().regex(/^\d+$/, 'League ID must be a number')
})

export const leagueIdSchema = z.object({
  league_id: z.number().int().positive('League ID must be a positive number')
})

export const cricketMatchesListSchema = z.object({
  series_type: z.string().optional(),
  series_id: z.string().optional(),
  match_type: z.enum(['live', 'complete', 'upcoming']).optional()
})

export const paginationQuerySchema = z.object({
  itemsPerPage: z.string().regex(/^\d+$/, 'Items per page must be a number').default('10').transform(Number),
  pageIndex: z.string().regex(/^\d+$/, 'Page index must be a number').default('0').transform(Number)
})

export const cricketMatchSchema = z.object({
  match_id: z.union([
    z.string().regex(/^\d+$/, 'Match ID must be a number'),
    z.number().int().positive('Match ID must be a positive number')
  ])
})

export const profileGenderSchema = z.object({})

export const userActivitySchema = z.object({
  activity_type: z.string().min(1, 'Activity type is required')
})

export const userMetaUpdateSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  pincode: z.number().int().min(100000).max(999999).optional(),
  state: z.string().max(100).optional(),
})

export const walletTransactionSchema = z.object({
  user_id: z.string().optional(),
  transaction_type: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
})

export const tdsSchema = z.object({
  user_id: z.string().optional(),
  date: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
})

export const gamificationQuerySchema = z.object({
  type: z.enum(['all', 'tiers', 'badges', 'rewards', 'stats']).optional(),
})

export const badgeProgressQuerySchema = z.object({
  progress: z.string().optional(),
  stats: z.string().optional(),
  rarity: z.string().optional(),
  category: z.string().optional(),
})

export const predictionResultsQuerySchema = z.object({
  match_id: z.string().min(1, 'Match ID is required'),
  league_id: z.string().optional(),
})

export const tierProgressQuerySchema = z.object({
  progression: z.string().optional(),
  stats: z.string().optional(),
})

export const generateReferralSchema = z.object({
  referralType: z.string().optional(),
  matchId: z.string().optional(),
})

export const redeemReferralSchema = z.object({
  referralToken: z.string().min(1, 'Referral token is required'),
})

export const notificationQuerySchema = z.object({
  userId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  unread: z.boolean().optional(),
})

export const notificationBulkActionSchema = z.object({
  action: z.enum(['mark_all_read', 'mark_all_unread']),
  notificationIds: z.array(z.string()).optional(),
})

export const notificationPreferencesSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
})
