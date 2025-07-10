import dotenv from 'dotenv'

dotenv.config()

export const config = {
	port: parseInt(process.env.PORT || '3001'),
	nodeEnv: process.env.NODE_ENV || 'development',
	frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

	supabase: {
		url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
		anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
	},

	database: {
		url: process.env.DATABASE_URL!,
	},

	rateLimit: {
		windowMs: 10 * 60 * 1000, // 10 minutes
		max: 100, // requests per window
	},

	aws: {
		region: process.env.AWS_REGION,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		bucketName: process.env.AWS_BUCKET_NAME,
	},

	razorpay: {
		keyId: process.env.RAZORPAY_KEY_ID,
		keySecret: process.env.RAZORPAY_KEY_SECRET,
	},

	firebase: {
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY,
		messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	},

	jwt: {
		secret: process.env.JWT_SECRET!,
	},

	redis: {
		url: process.env.REDIS_URL,
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT || '6379'),
		password: process.env.REDIS_PASSWORD,
	},

	// msg91: {
	// 	authKey: process.env.MSG91_AUTHKEY,
	// 	senderId: process.env.MSG91_SENDER_ID,
	// },

	scorecard: {
		cacheTTL: parseInt(process.env.SCORECARD_CACHE_TTL || '15'),
	},

	externalApi: {
		baseUrl: process.env.NEXT_PUBLIC_API_URL,
		apiHost: process.env.NEXT_PUBLIC_API_HOST,
		apiKey: process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
	},
}

// Validate required environment variables
const requiredEnvVars = [
	'NEXT_PUBLIC_SUPABASE_URL',
	'NEXT_PUBLIC_SUPABASE_ANON_KEY',
	'SUPABASE_SERVICE_ROLE_KEY',
	'DATABASE_URL',
	'JWT_SECRET',
]

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`)
	}
}
