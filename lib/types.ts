export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type DelinquencyStage = 'warning' | 'notice' | 'legal' | 'eviction'
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type TaskStatus = 'open' | 'in_progress' | 'done' | 'blocked'

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  status: TaskStatus
  due_date?: string
  category: 'pm' | 'vendor' | 'lease' | 'legal' | 'admin'
  created_at: string
  updated_at: string
}

export interface Lease {
  id: string
  unit: string
  resident_name: string
  move_in_date: string
  lease_end_date: string
  monthly_rent: number
  status: 'active' | 'expiring' | 'expired' | 'renewed'
  notes?: string
  created_at: string
}

export interface Delinquency {
  id: string
  unit: string
  resident_name: string
  balance: number
  days_delinquent: number
  stage: DelinquencyStage
  last_contact_date?: string
  last_contact_note?: string
  eviction_filing_date?: string
  court_date?: string
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  name: string
  trade: string
  phone?: string
  email?: string
  project_description?: string
  status: 'active' | 'completed' | 'on_hold' | 'overdue'
  scheduled_date?: string
  completed_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'move_in' | 'move_out' | 'lease_end' | 'vendor' | 'legal' | 'other'
  unit?: string
  description?: string
  created_at: string
}

export interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  dismissed: boolean
  link?: string
  created_at: string
}

export interface Briefing {
  id: string
  date: string
  content: string
  summary: string
  created_at: string
}
