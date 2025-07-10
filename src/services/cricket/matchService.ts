import { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../../utils/errorHandler'
import { getCache, setCache } from '../../utils/redis'
import { config } from '../../config'
import { Match } from '../../types'

export class CricketMatchService {
  async getMatch(supabase: SupabaseClient, matchId: string | number): Promise<Match[]> {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .eq('match_id', matchId)

      if (error) {
        throw error
      }

      return match as Match[]
    } catch (error) {
      console.error('Error fetching data:', error)
      throw new AppError('Error fetching match data', 500)
    }
  }

  async getScorecard(matchId: string | number): Promise<any> {
    try {
      const cacheKey = `scorecard:${matchId}`
      const cachedData = await getCache<any>(cacheKey)

      if (cachedData) {
        console.log('Data retrieved from cache for match_id:', matchId)
        return {
          data: cachedData,
          cached: true
        }
      }

      const response = await fetch(
        `${config.externalApi.baseUrl}/mcenter/v1/${matchId}/hscard`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': config.externalApi.apiHost!,
            'x-rapidapi-key': config.externalApi.apiKey!,
          },
        }
      )

      const data = await response.json()
      console.log('Data fetched from API successfully for match_id:', matchId)
      
      await setCache(cacheKey, data, config.scorecard.cacheTTL)

      return {
        data: data,
        cached: false
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      throw new AppError('Error fetching scorecard data', 500)
    }
  }
}
