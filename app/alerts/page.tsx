import { supabase } from '@/lib/supabase'
import type { Alert } from '@/lib/types'

async function getAlerts() {
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
}

const severityConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  critical: { emoji: '🔴', color: 'text-red-900', bg: 'bg-red-50 border-red-200' },
  high: { emoji: '🟠', color: 'text-orange-900', bg: 'bg-orange-50 border-orange-200' },
  medium: { emoji: '🟡', color: 'text-yellow-900', bg: 'bg-yellow-50 border-yellow-200' },
  low: { emoji: '🔵', color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200' },
}

export default async function AlertsPage() {
  const alerts = await getAlerts()
  const active = alerts.filter((a: Alert) => !a.dismissed)
  const dismissed = alerts.filter((a: Alert) => a.dismissed)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Alerts</h1>

      {active.length === 0 && dismissed.length === 0 && (
        <div className="bg-slate-100 rounded-xl p-12 border border-slate-200 border-dashed text-center">
          <p className="text-slate-500">No alerts yet. Alerts fire when thresholds are crossed — 48h stale tasks, 45+ day delinquencies, vendor no-shows.</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active ({active.length})</h2>
          {active.map((alert: Alert) => {
            const s = severityConfig[alert.severity] ?? severityConfig.low
            return (
              <div key={alert.id} className={`rounded-xl p-5 border ${s.bg}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{s.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${s.color}`}>{alert.title}</p>
                    <p className="text-sm text-slate-700 mt-1">{alert.message}</p>
                    {alert.link && (
                      <a href={alert.link} className="text-sm text-sky-600 hover:underline mt-2 inline-block">
                        View →
                      </a>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <form action={async () => {
                    'use server'
                    await supabase.from('alerts').update({ dismissed: true }).eq('id', alert.id)
                  }}>
                    <button className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-2 py-1 bg-white">
                      Dismiss
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {dismissed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Dismissed ({dismissed.length})</h2>
          <div className="space-y-2">
            {dismissed.map((alert: Alert) => (
              <div key={alert.id} className="rounded-xl p-4 border border-slate-200 bg-white opacity-50">
                <p className="font-medium text-slate-600">{alert.title}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
