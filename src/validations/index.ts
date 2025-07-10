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
