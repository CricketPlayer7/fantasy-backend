import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'
import { 
  SendNotificationRequest, 
  SendBulkNotificationRequest,
  NotificationResponse,
  BulkNotificationResult,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest
} from '../types'

export class NotificationsService {
  constructor(private supabase: any) {}

  async getNotifications(userId: string, page: number, limit: number, unread?: boolean) {
    try {
      const offset = (page - 1) * limit

      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (unread) {
        query = query.eq('read', false)
      }

      const { data: notifications, error } = await query

      if (error) {
        logger.error('Database error in getNotifications:', { error: error.message, userId })
        throw new AppError(`Database error: ${error.message}`, 500)
      }

      // Get unread count
      const { count: unreadCount, error: unreadCountError } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (unreadCountError) {
        logger.error('Error fetching unread count:', { error: unreadCountError.message, userId })
        throw new AppError(`Failed to fetch unread count: ${unreadCountError.message}`, 500)
      }

      // Get total count
      const { count: totalCount, error: totalCountError } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (totalCountError) {
        logger.error('Error fetching total count:', { error: totalCountError.message, userId })
        throw new AppError(`Failed to fetch total count: ${totalCountError.message}`, 500)
      }

      return {
        notifications,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
        },
        unreadCount: unreadCount || 0,
      }
    } catch (error) {
      logger.error('Error in getNotifications service:', { error, userId })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to fetch notifications', 500)
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        logger.error('Database error in markAsRead:', { error: error.message, notificationId, userId })
        throw new AppError(`Database error: ${error.message}`, 500)
      }

      return { success: true }
    } catch (error) {
      logger.error('Error in markAsRead service:', { error, notificationId, userId })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to mark notification as read', 500)
    }
  }

  async markAsClicked(notificationId: string) {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ clicked: true })
        .eq('id', notificationId)

      if (error) {
        logger.error('Database error in markAsClicked:', { error: error.message, notificationId })
        throw new AppError(`Database error: ${error.message}`, 500)
      }

      return { success: true }
    } catch (error) {
      logger.error('Error in markAsClicked service:', { error, notificationId })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to mark notification as clicked', 500)
    }
  }

  async bulkUpdate(userId: string, action: string, notificationIds?: string[]) {
    try {
      let updateData: any = {}

      switch (action) {
        case 'mark_all_read':
          updateData = { read: true }
          break
        case 'mark_all_unread':
          updateData = { read: false }
          break
        default:
          throw new AppError('Invalid action', 400)
      }

      let updateQuery = this.supabase
        .from('notifications')
        .update(updateData)
        .eq('user_id', userId)

      if (notificationIds && notificationIds.length > 0) {
        updateQuery = updateQuery.in('id', notificationIds)
      }

      const { error } = await updateQuery

      if (error) {
        logger.error('Database error in bulkUpdate:', { error: error.message, userId, action, notificationIds })
        throw new AppError(`Database error: ${error.message}`, 500)
      }

      return { success: true }
    } catch (error) {
      logger.error('Error in bulkUpdate service:', { error, userId, action, notificationIds })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to bulk update notifications', 500)
    }
  }

  async sendNotification(supabaseAdmin: any, notificationData: SendNotificationRequest): Promise<NotificationResponse> {
    try {
      // Use the database function to create notification
      const { data, error } = await supabaseAdmin.rpc('create_notification', {
        p_user_id: notificationData.user_id,
        p_title: notificationData.title,
        p_message: notificationData.message,
        p_type: notificationData.type,
        p_data: notificationData.data || {}
      })

      if (error) {
        logger.error('Database error in sendNotification:', { 
          error: error.message, 
          notificationData 
        })
        throw new AppError(`Failed to send notification: ${error.message}`, 500)
      }

      // Get the created notification
      const { data: notification, error: fetchError } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('id', data)
        .single()

      if (fetchError) {
        logger.error('Error fetching created notification:', { 
          error: fetchError.message, 
          notificationId: data 
        })
        throw new AppError('Notification sent but failed to retrieve details', 500)
      }

      logger.info('Notification sent successfully:', { 
        notificationId: data, 
        userId: notificationData.user_id,
        type: notificationData.type
      })

      return notification
    } catch (error) {
      logger.error('Error in sendNotification service:', { error, notificationData })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to send notification', 500)
    }
  }

  async sendBulkNotification(supabaseAdmin: any, bulkData: SendBulkNotificationRequest): Promise<BulkNotificationResult> {
    try {
      let targetUserIds: string[] = []

      if (bulkData.user_ids && bulkData.user_ids.length > 0) {
        // Use provided user IDs
        targetUserIds = bulkData.user_ids
      } else {
        // Get users based on filters
        targetUserIds = await this.getUsersByFilters(supabaseAdmin, bulkData.filters)
      }

      if (targetUserIds.length === 0) {
        logger.warn('No users found for bulk notification', { filters: bulkData.filters })
        return {
          success: true,
          sent_count: 0,
          failed_count: 0,
          notification_ids: []
        }
      }

      const results = {
        success: true,
        sent_count: 0,
        failed_count: 0,
        notification_ids: [] as string[],
        errors: [] as Array<{ user_id: string; error: string }>
      }

      // Send notifications in batches to avoid overwhelming the database
      const batchSize = 50
      for (let i = 0; i < targetUserIds.length; i += batchSize) {
        const batch = targetUserIds.slice(i, i + batchSize)
        
        await Promise.allSettled(
          batch.map(async (userId) => {
            try {
              const { data, error } = await supabaseAdmin.rpc('create_notification', {
                p_user_id: userId,
                p_title: bulkData.title,
                p_message: bulkData.message,
                p_type: bulkData.type,
                p_data: bulkData.data || {}
              })

              if (error) {
                results.failed_count++
                results.errors.push({ user_id: userId, error: error.message })
              } else {
                results.sent_count++
                results.notification_ids.push(data)
              }
            } catch (error) {
              results.failed_count++
              results.errors.push({ 
                user_id: userId, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })
            }
          })
        )

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < targetUserIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      logger.info('Bulk notification completed:', {
        total_users: targetUserIds.length,
        sent_count: results.sent_count,
        failed_count: results.failed_count,
        type: bulkData.type
      })

      return results
    } catch (error) {
      logger.error('Error in sendBulkNotification service:', { error, bulkData })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to send bulk notification', 500)
    }
  }

  private async getUsersByFilters(supabaseAdmin: any, filters?: SendBulkNotificationRequest['filters']): Promise<string[]> {
    try {
      if (!filters) {
        // Get all active users if no filters
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) {
          throw new AppError(`Failed to fetch users: ${error.message}`, 500)
        }
        return users.users
          .filter((user: any) => !user.banned_until && user.email_confirmed_at)
          .map((user: any) => user.id)
      }

      let userIds: string[] = []

      if (filters.has_device_token || filters.device_type) {
        // Filter by device information
        let deviceQuery = supabaseAdmin
          .from('user_devices')
          .select('user_id')
          .eq('is_active', true)

        if (filters.device_type) {
          deviceQuery = deviceQuery.eq('device_type', filters.device_type)
        }

        const { data: deviceUsers, error: deviceError } = await deviceQuery
        if (deviceError) {
          throw new AppError(`Failed to fetch device users: ${deviceError.message}`, 500)
        }

        userIds = deviceUsers.map((device: any) => device.user_id)
      } else {
        // Get users from auth
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) {
          throw new AppError(`Failed to fetch users: ${error.message}`, 500)
        }

        userIds = users.users.map((user: any) => user.id)
      }

      // Apply status filter
      if (filters.status && userIds.length > 0) {
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) {
          throw new AppError(`Failed to fetch users for status filter: ${error.message}`, 500)
        }

        const filteredUsers = users.users.filter((user: any) => {
          switch (filters.status) {
            case 'active':
              return !user.banned_until && user.email_confirmed_at
            case 'banned':
              return user.banned_until && new Date(user.banned_until) > new Date()
            case 'pending':
              return !user.email_confirmed_at
            default:
              return true
          }
        })

        const statusFilteredIds = filteredUsers.map((user: any) => user.id)
        userIds = userIds.filter(id => statusFilteredIds.includes(id))
      }

      return [...new Set(userIds)] // Remove duplicates
    } catch (error) {
      logger.error('Error in getUsersByFilters:', { error, filters })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to get users by filters', 500)
    }
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logger.error('Error fetching notification preferences:', { error: error.message, userId })
        throw new AppError('Failed to fetch notification preferences', 500)
      }

      // Return default preferences if none exist
      const preferences = data || {
        user_id: userId,
        push_enabled: true,
        email_enabled: true,
        sms_enabled: true
      }

      return preferences
    } catch (error) {
      logger.error('Error in getNotificationPreferences service:', { error, userId })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to get notification preferences', 500)
    }
  }

  async updateNotificationPreferences(preferencesData: UpdateNotificationPreferencesRequest): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from('notification_preferences')
        .upsert({
          user_id: preferencesData.user_id,
          push_enabled: preferencesData.push_enabled,
          email_enabled: preferencesData.email_enabled,
          sms_enabled: preferencesData.sms_enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        logger.error('Error updating notification preferences:', { 
          error: error.message, 
          userId: preferencesData.user_id 
        })
        throw new AppError('Failed to update notification preferences', 500)
      }

      logger.info('Notification preferences updated successfully:', { 
        userId: preferencesData.user_id,
        preferences: preferencesData
      })

      return { success: true }
    } catch (error) {
      logger.error('Error in updateNotificationPreferences service:', { error, preferencesData })
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to update notification preferences', 500)
    }
  }
}
