import { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../utils/errorHandler'
import { generateReferralToken, verifyReferralToken } from '../utils/referralToken'

export class ReferralService {
  async generateReferralLink(supabase: SupabaseClient, userId: string, referralType?: string, matchId?: string): Promise<any> {
    try {
      const { data: referralCodes, error: fetchError } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', userId)

      if (fetchError) {
        throw new AppError('Failed to fetch referral codes', 500)
      }

      if (!referralCodes || referralCodes.length === 0) {
        throw new AppError('No referral codes found. Please try logging in again.', 404)
      }

      const referralCode = referralCodes[0].code
      const refType = referralType || 'signup'

      if (referralType) {
        const { data: configCheck, error: configError } = await supabase
          .from('referral_config')
          .select('type')
          .eq('type', refType)
          .single()

        if (configError || !configCheck) {
          throw new AppError(`Invalid referral type: ${refType}. Available types: signup, match_invite`, 400)
        }
      }

      if (refType === 'match_invite') {
        if (!matchId) {
          throw new AppError('matchId is required for match_invite referrals', 400)
        }

        const { data: matchCheck, error: matchError } = await supabase
          .from('matches')
          .select('id, match_id, team_one_name, team_two_name, series_name, start')
          .eq('match_id', matchId)
          .single()

        if (matchError || !matchCheck) {
          throw new AppError(`Invalid match ID: ${matchId}`, 400)
        }

        const matchStart = new Date(matchCheck.start * 1000)
        const now = new Date()
        if (matchStart < now) {
          throw new AppError('Cannot create referral for past matches', 400)
        }
      }

      const tokenPayload: any = {
        referral_code: referralCode,
        referral_type: refType,
      }

      if (refType === 'match_invite' && matchId) {
        tokenPayload.match_id = matchId
      }

      const referralToken = generateReferralToken(tokenPayload)

      const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:3000'
      let referralLink = `${baseUrl}/refer?referral_code=${referralCode}&referral_type=${refType}&referral_token=${referralToken}`

      if (refType === 'match_invite' && matchId) {
        referralLink += `&match_id=${matchId}`
      }

      return {
        success: true,
        referralLink,
        referralCode,
        referralType: refType,
        matchId: refType === 'match_invite' ? matchId : undefined,
        expiresIn: '2 days',
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Unexpected error:', error)
      throw new AppError('Internal server error', 500)
    }
  }

  async getMyReferrals(supabase: SupabaseClient, userId: string): Promise<any> {
    try {
      const { data: referralCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', userId)
        .single()

      const { data: referralConfig } = await supabase
        .from('referral_config')
        .select('type, max_referrals_per_user, max_bonus_per_user, bonus_referrer, bonus_referee')

      const { data: userReferrals, error } = await supabase
        .from('referral_history')
        .select(`
          referee_id,
          referral_type,
          status,
          earned_amount,
          match_id,
          created_at
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new AppError('Failed to fetch user referrals', 500)
      }

      const refereeIds = userReferrals.map((ref) => ref.referee_id)
      const { data: usersData, error: usersError } = await supabase.rpc(
        'get_user_info',
        { user_ids: refereeIds }
      )

      if (usersError) {
        console.log('Error fetching user data:', usersError)
      }

      const userDataMap = new Map()
      if (usersData) {
        usersData.forEach((user: any) => {
          userDataMap.set(user.id, {
            email: user.email,
            phone: user.phone,
            full_name: user.full_name || 'Unknown User',
            avatar_url: user.avatar_url,
            created_at: user.created_at,
          })
        })
      }

      const formattedReferrals = userReferrals.map((ref) => {
        const userData = userDataMap.get(ref.referee_id)
        return {
          referee_id: ref.referee_id,
          referral_type: ref.referral_type,
          status: ref.status,
          earned_amount: ref.earned_amount || 0,
          match_id: ref.match_id,
          created_at: ref.created_at,
          user_info: userData || {
            full_name: 'Unknown User',
            email: null,
            phone: null,
            avatar_url: null,
          },
        }
      })

      const totalEarnings = userReferrals.reduce((sum, ref) => sum + (ref.earned_amount || 0), 0)

      const referralsByType: Record<string, { count: number; earnings: number }> = {}
      userReferrals.forEach((ref) => {
        const type = ref.referral_type
        if (!referralsByType[type]) {
          referralsByType[type] = { count: 0, earnings: 0 }
        }
        referralsByType[type].count += 1
        referralsByType[type].earnings += ref.earned_amount || 0
      })

      const referralLimits = referralConfig?.map((config) => ({
        type: config.type,
        max_referrals_per_user: config.max_referrals_per_user,
        max_bonus_per_user: config.max_bonus_per_user,
        bonus_referrer: config.bonus_referrer,
        bonus_referee: config.bonus_referee,
        current_referrals: referralsByType[config.type]?.count || 0,
        current_earnings: referralsByType[config.type]?.earnings || 0,
        referrals_remaining: Math.max(0, config.max_referrals_per_user - (referralsByType[config.type]?.count || 0)),
        bonus_remaining: Math.max(0, config.max_bonus_per_user - (referralsByType[config.type]?.earnings || 0)),
      })) || []

      return {
        success: true,
        data: {
          user_id: userId,
          referral_code: referralCode?.code || null,
          total_referrals: userReferrals.length,
          total_earnings: totalEarnings,
          referred_users: formattedReferrals,
          referral_limits: referralLimits,
        },
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Unexpected error:', error)
      throw new AppError('Internal server error', 500)
    }
  }

  async redeemReferral(supabase: SupabaseClient, userId: string, referralToken: string): Promise<any> {
    try {
      const decoded = verifyReferralToken(referralToken)

      if (!decoded) {
        throw new AppError('Invalid or expired token', 400)
      }

      const { referral_code, referral_type, match_id } = decoded

      if (referral_type === 'match_invite') {
        if (!match_id) {
          throw new AppError('Invalid match invitation: missing match information', 400)
        }

        const { data: matchCheck, error: matchError } = await supabase
          .from('matches')
          .select('id, match_id, team_one_name, team_two_name, series_name, start, match_state')
          .eq('match_id', match_id)
          .single()

        if (matchError || !matchCheck) {
          throw new AppError('Invalid match invitation: match not found', 400)
        }

        const matchStart = new Date(matchCheck.start * 1000)
        const now = new Date()
        if (matchStart < now && matchCheck.match_state !== 'upcoming') {
          throw new AppError('This match invitation has expired', 400)
        }
      }

      const { data: eligibilityResult, error: eligibilityError } = await supabase.rpc('check_referral_eligibility', {
        p_referee_id: userId,
        p_referral_code: referral_code,
        p_referral_type: referral_type,
        p_match_id: match_id || null,
      })

      if (eligibilityError) {
        throw new AppError('Failed to validate referral', 500)
      }

      if (!eligibilityResult.eligible) {
        throw new AppError(eligibilityResult.error, 400)
      }

      const { error: redemptionError } = await supabase.rpc('process_referral_redemption', {
        p_referrer_id: eligibilityResult.referrer_id,
        p_referee_id: userId,
        p_referral_code: referral_code,
        p_referral_type: referral_type,
        p_bonus_referrer: eligibilityResult.config.bonus_referrer,
        p_bonus_referee: eligibilityResult.config.bonus_referee,
        p_current_earnings: eligibilityResult.current_earnings,
        p_match_id: match_id || null,
      })

      if (redemptionError) {
        throw new AppError('Failed to process referral redemption', 500)
      }

      return {
        success: true,
        bonuses: {
          referrer: eligibilityResult.config.bonus_referrer,
          referee: eligibilityResult.config.bonus_referee,
        },
        matchId: match_id,
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Unexpected error:', error)
      throw new AppError('Internal server error', 500)
    }
  }
}
