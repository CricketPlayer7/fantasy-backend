import { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../utils/errorHandler'
import { Gender } from '../types'

export class ProfileService {
  async getGenders(supabase: SupabaseClient): Promise<Gender[]> {
    try {
      const { data: gender, error } = await supabase
        .from('gender')
        .select('*')

      if (error) {
        throw new AppError(error.message, 500)
      }

      return gender as Gender[]
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      console.error('Error fetching Gender data:', error)
      throw new AppError('Internal Server Error', 500)
    }
  }
}
