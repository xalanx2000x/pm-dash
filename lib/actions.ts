'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function completeTask(id: string) {
  return supabase.from('tasks').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', id)
}

export async function createTask(title: string, priority = 'medium') {
  return supabase.from('tasks').insert({ title, priority, status: 'open', category: 'pm' })
}

export async function dismissAlert(id: string) {
  return supabase.from('alerts').update({ dismissed: true }).eq('id', id)
}
