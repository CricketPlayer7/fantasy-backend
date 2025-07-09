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
