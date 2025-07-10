import { Client } from 'pg'
import { createClient } from '@supabase/supabase-js'
import { config } from '../../config'
import { notificationService } from './notificationService'
import { logger } from '../logger'

export class NotificationListener {
	private client: Client

	constructor() {
		this.client = new Client({
			connectionString: config.database.url,
		})
	}

	async start() {
		try {
			await this.client.connect()
			await this.client.query('LISTEN new_notification')

			this.client.on('notification', async (msg) => {
				if (msg.channel === 'new_notification') {
					const payload = JSON.parse(msg.payload || '{}')
					await this.handleNewNotification(payload)
				}
			})

			logger.info('🔔 Notification listener started')
		} catch (error) {
			logger.error('Error starting notification listener:', error)
		}
	}

	private async handleNewNotification(payload: any) {
		try {
			const supabase = createClient(
				config.supabase.url,
				config.supabase.serviceRoleKey,
				{
					auth: {
						persistSession: false,
						autoRefreshToken: false,
					},
				}
			)
			
			// Get notification details
			const { data: notification, error } = await supabase
				.from('notifications')
				.select('*')
				.eq('id', payload.notification_id)
				.single()

			if (error) {
				logger.error('Error fetching notification:', {
					error: error.message,
					notificationId: payload.notification_id
				})
				return
			}

			if (notification) {
				// Send through notification service
				await notificationService.send(
					notification.user_id,
					notification.title,
					notification.message,
					notification.type,
					notification.data
				)
			}
		} catch (error) {
			logger.error('Error handling notification:', { error, payload })
		}
	}

	async stop() {
		try {
			await this.client.end()
			logger.info('Notification listener stopped')
		} catch (error) {
			logger.error('Error stopping notification listener:', error)
		}
	}
}

export const notificationListener = new NotificationListener()
