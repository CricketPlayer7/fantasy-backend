import { createClient } from '@supabase/supabase-js'
import { config } from '../../config'
import { firebaseService } from './firebaseService'
import { logger } from '../logger'

interface NotificationChannel {
	name: string
	send(
		userId: string,
		title: string,
		message: string,
		type: string,
		data?: any
	): Promise<boolean>
}

export class NotificationService {
	private channels: NotificationChannel[] = []

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

	// Register channels (Firebase now, SMS/Email later)
	addChannel(channel: NotificationChannel) {
		this.channels.push(channel)
		logger.info(`Added notification channel: ${channel.name}`)
	}

	// Send notification through all active channels
	async send(
		userId: string,
		title: string,
		message: string,
		type: string,
		data?: any
	) {
		try {
			const supabase = await this.getSupabase()
			// Check user preferences
			const { data: prefs, error: prefsError } = await supabase
				.from('notification_preferences')
				.select('*')
				.eq('user_id', userId)
				.single()

			if (prefsError && prefsError.code !== 'PGRST116') {
				logger.error('Error fetching notification preferences:', {
					error: prefsError.message,
					userId
				})
			}

			// Send through appropriate channels
			const results = await Promise.all(
				this.channels.map(async (channel) => {
					// Check if user wants this channel
					if (
						channel.name === 'firebase_push' &&
						prefs?.push_enabled === false
					) {
						return false
					}
					if (
						channel.name === 'email' &&
						prefs?.email_enabled === false
					) {
						return false
					}
					if (
						channel.name === 'sms' &&
						prefs?.sms_enabled === false
					) {
						return false
					}

					return await channel.send(
						userId,
						title,
						message,
						type,
						data
					)
				})
			)

			const success = results.some((r) => r)
			
			logger.info('Notification sent through channels:', {
				userId,
				title,
				type,
				channels: this.channels.map(c => c.name),
				results,
				success
			})

			return success
		} catch (error) {
			logger.error('Notification service error:', { error, userId, title, type })
			return false
		}
	}
}

// Firebase Channel Implementation
class FirebaseChannel implements NotificationChannel {
	name = 'firebase_push'

	async send(
		userId: string,
		title: string,
		message: string,
		type: string,
		data?: any
	): Promise<boolean> {
		return await firebaseService.sendPush(userId, title, message, data)
	}
}

// Initialize service with Firebase
export const notificationService = new NotificationService()
notificationService.addChannel(new FirebaseChannel())
