import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  if (!supabase) return { openTasks: 0, expiringLeases: 0, totalDelinquencies: 0, activeAlerts: [], latestBriefing: null }
  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [tasks, leases, delinquencies, alerts, briefings] = await Promise.all([
    supabase.from('tasks').select('*', { count: 'exact' }).eq('status', 'open'),
    supabase.from('leases').select('*', { count: 'exact' }).gte('lease_end_date', today).lte('lease_end_date', thirtyDays),
    supabase.from('delinquencies').select('*', { count: 'exact' }),
    supabase.from('alerts').select('*').eq('dismissed', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('briefings').select('*').order('created_at', { ascending: false }).limit(1),
  ])

  return {
    openTasks: tasks.count ?? 0,
    expiringLeases: leases.data?.length ?? 0,
    totalDelinquencies: delinquencies.data?.length ?? 0,
    activeAlerts: alerts.data ?? [],
    latestBriefing: briefings.data?.[0] ?? null,
  }
}

export default async function Dashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Good morning</h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-6">
        <Link href="/tasks" className="bg-white rounded-xl p-6 border border-slate-200 hover:border-sky-400 transition-colors">
          <p className="text-sm text-slate-500">Open Tasks</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{stats.openTasks}</p>
        </Link>
        <Link href="/leases" className="bg-white rounded-xl p-6 border border-slate-200 hover:border-sky-400 transition-colors">
          <p className="text-sm text-slate-500">Leases Expiring (30d)</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">{stats.expiringLeases}</p>
        </Link>
        <Link href="/delinquencies" className="bg-white rounded-xl p-6 border border-slate-200 hover:border-sky-400 transition-colors">
          <p className="text-sm text-slate-500">Delinquent Accounts</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{stats.totalDelinquencies}</p>
        </Link>
      </div>

      {/* Active alerts */}
      {stats.activeAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide">Active Alerts</h2>
          <div className="mt-3 space-y-2">
            {stats.activeAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-red-100">
                <span className="text-red-500 mt-0.5">🚨</span>
                <div>
                  <p className="font-medium text-slate-900">{alert.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/alerts" className="text-sm text-red-600 font-medium mt-3 inline-block hover:underline">
            View all alerts →
          </Link>
        </div>
      )}

      {/* Latest briefing */}
      {stats.latestBriefing ? (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Today&apos;s Briefing</h2>
          <div className="mt-4 prose prose-slate prose-sm max-w-none">
            <p className="text-slate-700 whitespace-pre-wrap">{stats.latestBriefing.content}</p>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Generated {new Date(stats.latestBriefing.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 border-dashed">
          <p className="text-slate-500 text-sm">
            No briefing yet. Forward a Yardi report to your Gmail inbox to get started.
          </p>
        </div>
      )}
    </div>
  )
}
