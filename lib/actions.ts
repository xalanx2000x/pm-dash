'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nvodomjonsmepnzagavk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b2RvbWpvbnNtZXBuemFnYXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxOTI1NjQsImV4cCI6MjA5MTc2ODU2NH0.ams_Emxd_63_2l-0v2z-jUm89YbT3bb4FK6ZTYRQflE'
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
