import { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../../utils/errorHandler'
import { logger } from '../../utils/logger'
import { Match, PaginationQuery, PaginationMetadata, CricketMatchesListResponse } from '../../types'

export class CricketMatchesService {
  private matchType(data: string): string {
    if (data === 'live') {
      return 'in progress'
    } else if (data === 'complete') {
      return 'complete'
    } else {
      return 'upcoming'
    }
  }

  async getMatches(
    supabase: SupabaseClient,
    filters: {
      series_type?: string
      series_id?: string
      match_type?: string
    },
    pagination: PaginationQuery
  ): Promise<CricketMatchesListResponse> {
    try {
      const { series_type, series_id, match_type } = filters
      const { itemsPerPage, pageIndex } = pagination

      const now = Date.now()
      const tenDaysLater = now + 10 * 24 * 60 * 60 * 1000
      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000

      let query = supabase
        .from('matches')
        .select('*')
        .eq('is_match_enabled', true)

      // Special logic for complete matches
      if (match_type === 'complete') {
        // First, check how many complete matches exist in the last 3 days
        let checkQuery = supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('is_match_enabled', true)
          .eq('match_state', 'complete')
          .gte('start', threeDaysAgo)
          .lte('start', now)

        // Apply series filters if provided
        if (series_type) {
          checkQuery = checkQuery.eq('series_type', series_type)
        }
        if (series_id) {
          checkQuery = checkQuery.eq('series_id', series_id)
        }

        const { count: last3DaysCount, error: checkError } = await checkQuery

        if (checkError) {
          logger.error('Error checking complete matches count:', checkError)
          throw new AppError('Failed to check complete matches count', 500)
        }

        // Apply the logic based on count with pagination
        if (last3DaysCount && last3DaysCount < 10) {
          // Fetch last 10 complete matches regardless of date with pagination
          const from = pageIndex * itemsPerPage
          const to = from + itemsPerPage - 1

          query = query
            .eq('match_state', 'complete')
            .order('start', { ascending: false }) // Descending for most recent first
            .range(from, to)
        } else {
          // Fetch matches from last 3 days with pagination
          const from = pageIndex * itemsPerPage
          const to = from + itemsPerPage - 1

          query = query
            .eq('match_state', 'complete')
            .gte('start', threeDaysAgo)
            .lte('start', now)
            .order('start', { ascending: false }) // Descending for most recent first
            .range(from, to)
        }
      } else {
        // Original logic for non-complete matches
        query = query.order('start', { ascending: true }) // Ascending for upcoming/live

        if (match_type !== 'live') {
          query = query.gte('start', now)
          query = query.lte('start', tenDaysLater)
        }

        if (match_type) {
          query = query.eq('match_state', this.matchType(match_type.toLowerCase()))
        }

        // Add pagination for non-complete matches
        const from = pageIndex * itemsPerPage
        const to = from + itemsPerPage - 1
        query = query.range(from, to)
      }

      // Apply series filters
      if (series_type) {
        query = query.eq('series_type', series_type)
      }

      if (series_id) {
        query = query.eq('series_id', series_id)
      }

      const { data: matches, error } = await query

      if (error) {
        logger.error('Error fetching matches:', error)
        throw new AppError('Failed to fetch matches', 500)
      }

      // Get total count for pagination metadata
      const totalCount = await this.getTotalCount(
        supabase,
        filters,
        now,
        tenDaysLater,
        threeDaysAgo
      )

      const paginationMetadata: PaginationMetadata = {
        pageIndex,
        itemsPerPage,
        totalItems: totalCount,
        totalPages: totalCount ? Math.ceil(totalCount / itemsPerPage) : 0
      }

      return {
        data: matches as Match[],
        pagination: paginationMetadata
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      logger.error('Unexpected error in getMatches:', error)
      throw new AppError('Failed to fetch matches', 500)
    }
  }

  private async getTotalCount(
    supabase: SupabaseClient,
    filters: {
      series_type?: string
      series_id?: string
      match_type?: string
    },
    now: number,
    tenDaysLater: number,
    threeDaysAgo: number
  ): Promise<number> {
    const { series_type, series_id, match_type } = filters

    let countQuery = supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('is_match_enabled', true)

    // Apply the same filters for count
    if (match_type === 'complete') {
      // For complete matches, count based on the same logic
      let checkCountQuery = supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('is_match_enabled', true)
        .eq('match_state', 'complete')
        .gte('start', threeDaysAgo)
        .lte('start', now)

      // Apply series filters to check query
      if (series_type) {
        checkCountQuery = checkCountQuery.eq('series_type', series_type)
      }
      if (series_id) {
        checkCountQuery = checkCountQuery.eq('series_id', series_id)
      }

      const { count: last3DaysCount } = await checkCountQuery

      if (last3DaysCount && last3DaysCount < 10) {
        // Count all complete matches (for last 10 logic)
        countQuery = countQuery.eq('match_state', 'complete')
      } else {
        // Count matches from last 3 days only
        countQuery = countQuery
          .eq('match_state', 'complete')
          .gte('start', threeDaysAgo)
          .lte('start', now)
      }
    } else {
      // Original count logic for non-complete matches
      if (match_type !== 'live') {
        countQuery = countQuery.gte('start', now)
        countQuery = countQuery.lte('start', tenDaysLater)
      }
      if (match_type) {
        countQuery = countQuery.eq('match_state', this.matchType(match_type.toLowerCase()))
      }
    }

    // Apply series filters to count query
    if (series_type) {
      countQuery = countQuery.eq('series_type', series_type)
    }
    if (series_id) {
      countQuery = countQuery.eq('series_id', series_id)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      logger.warn('Error getting count:', countError)
      return 0
    }

    return count || 0
  }
}
