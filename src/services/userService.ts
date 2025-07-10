import { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../utils/errorHandler'
import { UserActivityLog } from '../types'

export class UserService {
  async trackActivity(supabase: SupabaseClient, userId: string, activityType: string): Promise<any> {
    try {
      if (activityType !== 'login') {
        throw new AppError('This API only handles login tracking. Other activities are handled automatically by triggers.', 400)
      }

      const today = new Date().toISOString().split('T')[0]

      // Get current activity data
      const { data: currentActivity } = await supabase
        .from('user_activity_log')
        .select('current_streak, last_activity_date, total_active_days, longest_streak, streak_start_date')
        .eq('user_id', userId)
        .single()

      const isFirstLoginToday = currentActivity?.last_activity_date !== today

      // Update activity log ONLY for login
      if (isFirstLoginToday) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const wasActiveYesterday = currentActivity?.last_activity_date === yesterdayStr
        const newStreak = wasActiveYesterday ? (currentActivity.current_streak || 0) + 1 : 1
        const newLongestStreak = Math.max(currentActivity?.longest_streak || 0, newStreak)

        await supabase.from('user_activity_log').upsert({
          user_id: userId,
          last_activity_date: today,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          total_active_days: (currentActivity?.total_active_days || 0) + 1,
          days_inactive: 0,
          is_inactive_30_days: false,
          streak_start_date: wasActiveYesterday ? currentActivity.streak_start_date : today,
          streak_end_date: null,
          updated_at: new Date().toISOString(),
        })
      }

      // Check daily bonus eligibility
      const { data: dailyBonusResult, error: bonusError } = await supabase.rpc('award_daily_login_bonus')

      let bonusStatus = {
        eligible: false,
        amount: 0,
        message: 'Daily bonus not available',
      }

      if (!bonusError && dailyBonusResult?.success) {
        bonusStatus = {
          eligible: true,
          amount: dailyBonusResult.amount || 0,
          message: dailyBonusResult.message || 'Daily bonus available',
        }
      } else if (dailyBonusResult?.message) {
        bonusStatus.message = dailyBonusResult.message
      }

      // Get updated activity data
      const { data: updatedActivity } = await supabase
        .from('user_activity_log')
        .select('current_streak, longest_streak, total_active_days, last_activity_date')
        .eq('user_id', userId)
        .single()

      return {
        success: true,
        message: isFirstLoginToday ? 'Login tracked successfully!' : 'Welcome back!',
        data: {
          activity_type: 'login',
          first_login_today: isFirstLoginToday,
          timestamp: new Date().toISOString(),
          activity_status: updatedActivity || {},
          daily_bonus: bonusStatus,
          opportunities: {
            next_streak_milestone: Math.ceil((updatedActivity?.current_streak || 0) + 1 / 10) * 10,
            days_until_next_milestone: Math.ceil((updatedActivity?.current_streak || 0) + 1 / 10) * 10 - (updatedActivity?.current_streak || 0),
            note: 'Tier upgrades and win streaks are tracked automatically when you play!',
          },
        },
        system: {
          login_tracking: 'manual_api_required',
          other_activities: 'automatic_triggers',
          tier_updates: 'automatic_on_league_join',
          win_streaks: 'automatic_on_league_win',
          activity_logging: 'automatic_on_transactions',
        },
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Error tracking login:', error)
      throw new AppError('Failed to track login activity', 500)
    }
  }
}
