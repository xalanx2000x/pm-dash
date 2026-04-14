import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  // Vercel build may not source .env.production.local — fall back to hardcoded values
  const url = supabaseUrl || 'https://nvodomjonsmepnzagavk.supabase.co'
  const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b2RvbWpvbnNtZXBuemFnYXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxOTI1NjQsImV4cCI6MjA5MTc2ODU2NH0.ams_Emxd_63_2l-0v2z-jUm89YbT3bb4FK6ZTYRQflE'

  if (!url || !key) return null

  _supabase = createClient(url, key)
  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    if (!client) {
      const noop = () => ({ data: null, error: { message: 'Supabase not configured' }, then: () => noop(), catch: () => noop() })
      return noop
    }
    return (client as any)[prop]
  },
})
