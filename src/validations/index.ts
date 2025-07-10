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
