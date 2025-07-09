import { createClient } from '@supabase/supabase-js'
import { EmailOtpType } from '@supabase/supabase-js'
import { config } from '../config'

export class AuthService {
  private createSupabaseClient() {
    return createClient(
      config.supabase.url,
      config.supabase.anonKey
    )
  }

  async verifyOtp(tokenHash: string, type: EmailOtpType) {
    const supabase = this.createSupabaseClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })
    return { error }
  }

  async signOut(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.auth.signOut()
    }
    
    return { success: true }
  }
}
