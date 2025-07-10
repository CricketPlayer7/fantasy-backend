import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { createClient } from '@supabase/supabase-js'
import { config } from '../../config'
import { logger } from '../logger'

// Initialize Firebase Admin
if (getApps().length === 0) {
	initializeApp({
		credential: cert({
			projectId: config.firebase.projectId,
			clientEmail: config.firebase.clientEmail,
			privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n'),
		}),
	})
}

export class FirebaseService {
	private messaging = getMessaging()
	
	private async getSupabase() {
		return createClient(
			config.supabase.url,
			config.supabase.serviceRoleKey,
			{
				auth: {
					persistSession: false,
					autoRefreshToken: false,
				},
			}
		)
	}

	// Get user's device tokens
	async getUserTokens(userId: string): Promise<string[]> {
		try {
			const supabase = await this.getSupabase()
			const { data } = await supabase
				.from('user_devices')
				.select('device_token')
				.eq('user_id', userId)
				.eq('is_active', true)

			return data?.map((d) => d.device_token) || []
		} catch (error) {
			logger.error('Error getting user tokens:', { error, userId })
			return []
		}
	}

	// Send push notification
	async sendPush(
		userId: string,
		title: string,
		message: string,
		data?: any
	): Promise<boolean> {
		try {
			const tokens = await this.getUserTokens(userId)

			if (tokens.length === 0) {
				logger.info('No tokens found for user:', { userId })
				return false
			}

			const pushMessage = {
				notification: {
					title,
					body: message,
				},
				data: data
					? Object.fromEntries(
							Object.entries(data).map(([k, v]) => [k, String(v)])
					  )
					: {},
				tokens,
			}

			const response = await this.messaging.sendEachForMulticast(
				pushMessage
			)

			// Remove invalid tokens
			if (response.failureCount > 0) {
				const invalidTokens: string[] = []
				response.responses.forEach((resp, idx) => {
					if (
						!resp.success &&
						(resp.error?.code ===
							'messaging/registration-token-not-registered' ||
							resp.error?.code ===
								'messaging/invalid-registration-token')
					) {
						invalidTokens.push(tokens[idx])
					}
				})

				if (invalidTokens.length > 0) {
					await this.removeInvalidTokens(invalidTokens)
				}
			}

			logger.info('Push notification sent:', {
				userId,
				title,
				successCount: response.successCount,
				failureCount: response.failureCount
			})

			return response.successCount > 0
		} catch (error) {
			logger.error('Firebase push error:', { error, userId, title })
			return false
		}
	}

	// Remove invalid tokens
	private async removeInvalidTokens(tokens: string[]) {
		try {
			const supabase = await this.getSupabase()
			const { error } = await supabase
				.from('user_devices')
				.update({ is_active: false })
				.in('device_token', tokens)

			if (error) {
				logger.error('Error removing invalid tokens:', { error: error.message, tokens })
			} else {
				logger.info('Removed invalid tokens:', { count: tokens.length })
			}
		} catch (error) {
			logger.error('Error removing invalid tokens:', { error, tokens })
		}
	}
}

export const firebaseService = new FirebaseService()
