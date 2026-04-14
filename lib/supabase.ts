import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function createSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  // Skip during build when env vars aren't set yet (placeholder values)
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    throw new Error('SUPABASE_NOT_CONFIGURED')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase
  _supabase = createSupabase()
  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    try {
      return (getSupabase() as any)[prop]
    } catch (e: any) {
      if (e.message === 'SUPABASE_NOT_CONFIGURED') return () => ({ data: null, error: null })
      throw e
    }
  },
})
