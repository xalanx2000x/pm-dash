import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function createSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  // Log actual values during build so we can debug what's happening
  console.error('[DEBUG] NEXT_PUBLIC_SUPABASE_URL:', JSON.stringify(supabaseUrl))
  console.error('[DEBUG] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'EMPTY')

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_NOT_CONFIGURED: url=' + supabaseUrl + ' key=' + (supabaseAnonKey ? 'present' : 'missing'))
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
      if (e.message.startsWith('SUPABASE_NOT_CONFIGURED')) return () => ({ data: null, error: null })
      throw e
    }
  },
})
