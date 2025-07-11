import { z } from 'zod'

export const authConfirmSchema = z.object({
	token_hash: z.string().min(1, 'Token hash is required'),
	type: z.enum(['signup', 'email_change', 'recovery', 'invite'], {
		errorMap: () => ({ message: 'Invalid OTP type' }),
	}),
})

export const sentimentQuerySchema = z.object({
	league_id: z.string().regex(/^\d+$/, 'League ID must be a number'),
	match_id: z.string().regex(/^\d+$/, 'Match ID must be a number'),
	question_id: z
		.string()
		.regex(/^\d+$/, 'Question ID must be a number')
		.optional(),
})

export const applyCouponSchema = z.object({
	coupon_code: z.string().min(3).max(50),
	amount: z.number().positive(),
	usage_type: z.enum(['deposit', 'league_entry']),
	league_id: z.number().int().positive().optional(),
	match_id: z.number().int().positive().optional(),
})

export const deviceRegisterSchema = z.object({
	deviceToken: z.string().min(1, 'Device token is required'),
	deviceType: z.enum(['android', 'ios', 'web']).default('android'),
})

export const createOrderSchema = z.object({
	amount: z.number().positive('Amount must be positive'),
	user_name: z.string().min(1, 'User name is required'),
	user_id: z.string().optional(), // Will be added from the authenticated user
	coupon_id: z.string().optional().nullable(),
	coupon_code: z.string().optional().nullable(),
	original_amount: z.number().positive().optional().nullable(),
	final_amount: z.number().positive().optional().nullable(),
	discount_applied: z.number().min(0).optional().nullable(),
	usage_id: z.string().optional().nullable(),
})

export const cricketAnswersQuerySchema = z.object({
	league_id: z.string().regex(/^\d+$/, 'League ID must be a number'),
})

export const cricketLeaderboardQuerySchema = z
	.object({
		match_id: z.string().regex(/^\d+$/, 'Match ID must be a number'),
		league_id: z
			.string()
			.regex(/^\d+$/, 'League ID must be a number')
			.optional(),
		type: z.enum(['match', 'league']).default('league'),
		limit: z
			.string()
			.regex(/^\d+$/, 'Limit must be a number')
			.default('50')
			.transform(Number),
		offset: z
			.string()
			.regex(/^\d+$/, 'Offset must be a number')
			.default('0')
			.transform(Number),
	})
	.refine(
		(data) => {
			if (data.type === 'league' && !data.league_id) {
				return false
			}
			return true
		},
		{
			message: 'league_id is required when type is "league"',
			path: ['league_id'],
		}
	)

export const cricketLeagueParticipantsCountSchema = z.object({
	match_id: z.string().regex(/^\d+$/, 'Match ID must be a number'),
	league_id: z.string().regex(/^\d+$/, 'League ID must be a number'),
})

export const leagueIdSchema = z.object({
	league_id: z.number().int().positive('League ID must be a positive number'),
})

export const cricketMatchesListSchema = z.object({
	series_type: z.string().optional(),
	series_id: z.string().optional(),
	match_type: z.enum(['live', 'complete', 'upcoming']).optional(),
})

export const paginationQuerySchema = z.object({
	itemsPerPage: z
		.string()
		.regex(/^\d+$/, 'Items per page must be a number')
		.default('10')
		.transform(Number),
	pageIndex: z
		.string()
		.regex(/^\d+$/, 'Page index must be a number')
		.default('0')
		.transform(Number),
})

export const cricketMatchSchema = z.object({
	match_id: z.union([
		z.string().regex(/^\d+$/, 'Match ID must be a number'),
		z.number().int().positive('Match ID must be a positive number'),
	]),
})

export const profileGenderSchema = z.object({})

export const userActivitySchema = z.object({
	activity_type: z.string().min(1, 'Activity type is required'),
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

export const notificationBulkActionSchema = z.object({
	action: z.enum(['mark_all_read', 'mark_all_unread']),
	notificationIds: z.array(z.string()).optional(),
})

export const getUsersQuerySchema = z.object({
	page: z
		.string()
		.regex(/^\d+$/, 'Page must be a number')
		.optional()
		.default('1')
		.transform(Number),
	limit: z
		.string()
		.regex(/^\d+$/, 'Limit must be a number')
		.optional()
		.default('50')
		.transform(Number),
	search: z.string().optional(),
	status: z.enum(['active', 'banned', 'pending']).optional(),
	sortBy: z
		.enum(['created_at', 'email', 'last_sign_in_at'])
		.optional()
		.default('created_at'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const updateKycStatusSchema = z.object({
	submissionId: z.string().min(1, 'Submission ID is required'),
	status: z.enum(['pending', 'approved', 'rejected'], {
		errorMap: () => ({
			message: 'Status must be pending, approved, or rejected',
		}),
	}),
})

export const gstQuerySchema = z.object({
	page: z
		.string()
		.regex(/^\d+$/, 'Page must be a number')
		.transform(Number)
		.default('1'),
	limit: z
		.string()
		.regex(/^\d+$/, 'Limit must be a number')
		.transform(Number)
		.default('10'),
})

export const updateLeagueSchema = z.object({
	id: z.string().min(1, 'League ID is required'),
	name: z.string().min(1).optional(),
	prize: z.number().optional(),
	description: z.string().optional(),
	enabled: z.boolean().optional(),
	no_of_questions: z.number().int().optional(),
	entry_fee: z.number().optional(),
	subtitle: z.string().optional(),
	max_entries_per_user: z.number().int().optional(),
})

export const getAdminAnswersQuerySchema = z.object({
	match_id: z.string().min(1, 'Match ID is required'),
	league_id: z.string().min(1, 'League ID is required'),
})

export const saveAdminAnswersSchema = z.object({
	match_id: z.string().min(1, 'Match ID is required'),
	league_id: z.string().min(1, 'League ID is required'),
	question_answer: z.any(),
})

export const matchQuerySchema = z.object({
	series_type: z.string().min(1),
	match_state: z.string().optional(),
	search: z.string().optional(),
})

export const matchActionSchema = z.object({
	match_id: z.string().min(1, 'Match ID is required'),
	action: z.enum(['publish', 'void']),
})

export const paymentDetailsQuerySchema = z.object({
	user_id: z.string().min(1, 'User ID is required'),
	method: z.enum(['bank', 'upi'], {
		errorMap: () => ({ message: 'Method must be either "bank" or "upi"' }),
	}),
})

export const getQuestionsQuerySchema = z.object({
	match_id: z.string().min(1, 'Match ID is required'),
	league_id: z.string().min(1, 'League ID is required'),
})

export const saveQuestionsBodySchema = z.object({
	questions: z.array(
		z.object({
			match_id: z.string().min(1),
			league_id: z.string().min(1),
			question: z.string().min(1),
		})
	),
})

export const approveWithdrawalSchema = z.object({
	withdrawal_id: z.string().min(1, 'Withdrawal ID is required'),
	user_id: z.string().min(1, 'User ID is required'),
	amount: z.number().positive('Amount must be positive'),
})

export const paginationSchema = z.object({
	page: z.string().optional().default('1').transform(Number),
	perPage: z.string().optional().default('50').transform(Number),
})

export const adminUsersPaginationSchema = z.object({
	page: z.string().optional().default('1').transform(Number),
	perPage: z.string().optional().default('50').transform(Number),
	showBots: z.string().optional().default('false').transform((val) => val.toLowerCase() === 'true'),
})

export const banUserSchema = z.object({
	user_id: z.string().min(1, 'User ID is required'),
	ban: z.boolean(),
})

export const walletBonusSchema = z.object({
	user_id: z.string().min(1, 'User ID is required'),
	amount: z.number().positive('Amount must be positive'),
})

export const sendNotificationSchema = z.object({
	user_id: z.string().uuid('Invalid user ID format'),
	title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
	message: z.string().min(1, 'Message is required'),
	type: z.enum([
		'money_success', 'money_failed', 'withdrawal_approved', 'withdrawal_rejected',
		'kyc_verified', 'kyc_rejected', 'contest_won', 'contest_lost', 'promotional'
	]),
	data: z.record(z.any()).optional().default({})
})

export const sendBulkNotificationSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
	message: z.string().min(1, 'Message is required'),
	type: z.enum([
		'money_success', 'money_failed', 'withdrawal_approved', 'withdrawal_rejected',
		'kyc_verified', 'kyc_rejected', 'contest_won', 'contest_lost', 'promotional'
	]),
	data: z.record(z.any()).optional().default({}),
	user_ids: z.array(z.string().uuid('Invalid user ID format')).optional(),
	filters: z.object({
		status: z.enum(['active', 'banned', 'pending']).optional(),
		device_type: z.enum(['android', 'ios']).optional(),
		has_device_token: z.boolean().optional()
	}).optional()
})

export const updateNotificationPreferencesSchema = z.object({
	user_id: z.string().uuid('Invalid user ID format'),
	push_enabled: z.boolean(),
	email_enabled: z.boolean(),
	sms_enabled: z.boolean()
})
