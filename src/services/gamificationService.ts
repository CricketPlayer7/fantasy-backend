import { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../utils/errorHandler'

export class GamificationService {
  async getGamificationData(supabase: SupabaseClient, userId: string, type?: string): Promise<any> {
    try {
      if (!type || type === 'all') {
        const [tierResult, badgesResult, rewardsResult, activityResult, allTiersResult, allBadgesResult] = await Promise.all([
          supabase.from('user_tiers').select('*, tier_config:tier_configs(*)').eq('user_id', userId).single(),
          supabase.from('user_badges').select('*, badge_config:badge_configs(*)').eq('user_id', userId).eq('is_active', true).order('earned_date', { ascending: false }),
          supabase.from('user_rewards').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
          supabase.from('user_activity_log').select('*').eq('user_id', userId).single(),
          supabase.from('tier_configs').select('*').eq('is_active', true).order('tier_level', { ascending: true }),
          supabase.from('badge_configs').select('*').eq('is_active', true).order('display_order', { ascending: true })
        ])

        return {
          user_tier: tierResult.data,
          user_badges: badgesResult.data || [],
          user_rewards: rewardsResult.data || [],
          user_activity: activityResult.data,
          all_tiers: allTiersResult.data || [],
          all_badges: allBadgesResult.data || []
        }
      } else if (type === 'tiers') {
        const [userTierResult, allTiersResult] = await Promise.all([
          supabase.from('user_tiers').select('*, tier_config:tier_configs(*)').eq('user_id', userId).single(),
          supabase.from('tier_configs').select('*').eq('is_active', true).order('tier_level', { ascending: true })
        ])

        return {
          user_tier: userTierResult.data,
          all_tiers: allTiersResult.data || []
        }
      } else if (type === 'badges') {
        const [userBadgesResult, allBadgesResult] = await Promise.all([
          supabase.from('user_badges').select('*, badge_config:badge_configs(*)').eq('user_id', userId).eq('is_active', true).order('earned_date', { ascending: false }),
          supabase.from('badge_configs').select('*').eq('is_active', true).order('display_order', { ascending: true })
        ])

        return {
          user_badges: userBadgesResult.data || [],
          all_badges: allBadgesResult.data || []
        }
      } else if (type === 'rewards') {
        const { data: rewards } = await supabase.from('user_rewards').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
        return { user_rewards: rewards || [] }
      } else if (type === 'stats') {
        const [tierResult, activityResult, predictionStatsResult] = await Promise.all([
          supabase.from('user_tiers').select('stats').eq('user_id', userId).single(),
          supabase.from('user_activity_log').select('*').eq('user_id', userId).single(),
          supabase.from('user_prediction_stats').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
        ])

        return {
          tier_stats: tierResult.data?.stats || {},
          activity_stats: activityResult.data,
          prediction_stats: predictionStatsResult.data || []
        }
      }

      throw new AppError('Invalid type parameter', 400)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Server error:', error)
      throw new AppError('Internal server error', 500)
    }
  }

  async getBadges(supabase: SupabaseClient, userId: string): Promise<any> {
    try {
      const [userBadges, allBadges] = await Promise.all([
        supabase.from('user_badges').select('*, badge_config:badge_configs(*)').eq('user_id', userId).eq('is_active', true).order('earned_date', { ascending: false }),
        supabase.from('badge_configs').select('*').eq('is_active', true).order('display_order', { ascending: true })
      ])

      return {
        earned_badges: userBadges.data || [],
        available_badges: allBadges.data || []
      }
    } catch (error) {
      console.error('Server error:', error)
      throw new AppError('Internal server error', 500)
    }
  }

  async getPredictionResults(supabase: SupabaseClient, userId: string, matchId: string, leagueId?: string): Promise<any> {
    try {
      // Build user answers query
      let userAnswersQuery = supabase
        .from('user_answers')
        .select('*, questions(id, question)')
        .eq('user_id', userId)
        .eq('match_id', matchId)
      
      if (leagueId) {
        userAnswersQuery = userAnswersQuery.eq('league_id', leagueId)
      }

      // Build admin answers query
      let adminAnswersQuery = supabase
        .from('admin_answers')
        .select('*')
        .eq('match_id', matchId)
      
      if (leagueId) {
        adminAnswersQuery = adminAnswersQuery.eq('league_id', leagueId)
      }

      const [predictionStats, userAnswers, adminAnswers] = await Promise.all([
        supabase.from('user_prediction_stats').select('*').eq('user_id', userId).eq('period_type', 'match').eq('period_identifier', matchId).single(),
        userAnswersQuery,
        adminAnswersQuery.single()
      ])

      return {
        prediction_stats: predictionStats.data,
        user_answers: userAnswers.data || [],
        admin_answers: adminAnswers.data
      }
    } catch (error) {
      console.error('Server error:', error)
      throw new AppError('Internal server error', 500)
    }
  }

  async getTiers(supabase: SupabaseClient, userId: string): Promise<any> {
    try {
      const [userTier, allTiers] = await Promise.all([
        supabase.from('user_tiers').select('*, tier_config:tier_configs(*)').eq('user_id', userId).single(),
        supabase.from('tier_configs').select('*').eq('is_active', true).order('tier_level', { ascending: true })
      ])

      return {
        current_tier: userTier.data,
        available_tiers: allTiers.data || []
      }
    } catch (error) {
      console.error('Server error:', error)
      throw new AppError('Internal server error', 500)
    }
  }
}
