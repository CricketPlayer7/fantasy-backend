import { logger } from '../utils/logger'
import { AppError } from '../utils/errorHandler'

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
}
