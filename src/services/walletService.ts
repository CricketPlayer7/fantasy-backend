import { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../utils/errorHandler'
import { WalletTransactionRequest, TdsRequest } from '../types'

export class WalletService {
  async getInGameTransactions(supabase: SupabaseClient, userId: string, filters: WalletTransactionRequest): Promise<any> {
    try {
      const { transaction_type, date, status, limit = 10, offset = 0 } = filters

      let query = supabase
        .from('wallet_transactions')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .eq('user_id', userId)
        .order("created_at", { ascending: false })

      if (date) {
        query = query.eq('date', date)
      }
      if (transaction_type) {
        query = query.eq('transaction_type', transaction_type)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) {
        throw new AppError(error.message, 500)
      }

      return { data, count }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Error fetching transaction data:', error)
      throw new AppError('Internal Server Error', 500)
    }
  }

  async getTransactions(supabase: SupabaseClient, userId: string, filters: WalletTransactionRequest): Promise<any> {
    try {
      const { transaction_type, date, status, limit = 10, offset = 0 } = filters

      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .eq('user_id', userId)
        .order("created_at", { ascending: false })

      if (date) {
        query = query.eq('date', date)
      }
      if (transaction_type) {
        query = query.eq('transaction_type', transaction_type)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) {
        throw new AppError(error.message, 500)
      }

      return { data, count }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Error fetching transaction data:', error)
      throw new AppError('Internal Server Error', 500)
    }
  }

  async getTds(supabase: SupabaseClient, userId: string, filters: TdsRequest): Promise<any> {
    try {
      const { date, limit = 10, offset = 0 } = filters

      let query = supabase
        .from('tds')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false })

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error, count } = await query

      if (error) {
        throw new AppError(error.message, 500)
      }

      return { data, count }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Error fetching TDS data:', error)
      throw new AppError('Internal Server Error', 500)
    }
  }
}
