import { supabase } from '@/lib/supabase'
import type { Delinquency, DelinquencyStage } from '@/lib/types'

async function getDelinquencies() {
  const { data } = await supabase
    .from('delinquencies')
    .select('*')
    .order('days_delinquent', { ascending: false })

  return data ?? []
}

const stageConfig: Record<DelinquencyStage, { label: string; color: string; bg: string }> = {
  warning: { label: 'Warning', color: 'text-yellow-800', bg: 'bg-yellow-100 border-yellow-200' },
  notice: { label: 'Pay or Quit Notice', color: 'text-orange-800', bg: 'bg-orange-100 border-orange-200' },
  legal: { label: 'Legal Action', color: 'text-red-800', bg: 'bg-red-100 border-red-200' },
  eviction: { label: 'Eviction Filed', color: 'text-red-900', bg: 'bg-red-200 border-red-300' },
}

export default async function DelinquenciesPage() {
  const delinquencies = await getDelinquencies()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Delinquencies</h1>

      {delinquencies.length === 0 ? (
        <div className="bg-slate-100 rounded-xl p-12 border border-slate-200 border-dashed text-center">
          <p className="text-slate-500">No delinquent accounts. Forward a Yardi delinquency report to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {delinquencies.map((d: Delinquency) => {
            const stage = stageConfig[d.stage]
            return (
              <div key={d.id} className={`rounded-xl p-6 border ${stage.bg}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${stage.color} bg-white/80`}>
                        {stage.label}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${d.days_delinquent >= 60 ? 'bg-red-200 text-red-900' : d.days_delinquent >= 45 ? 'bg-orange-200 text-orange-900' : 'bg-yellow-200 text-yellow-900'}`}>
                        {d.days_delinquent} days
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 mt-3 text-lg">Unit {d.unit} — {d.resident_name}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">${d.balance.toLocaleString()}</p>
                    {d.last_contact_date && (
                      <p className="text-sm text-slate-600 mt-2">
                        Last contact: {new Date(d.last_contact_date).toLocaleDateString()}
                        {d.last_contact_note && ` — ${d.last_contact_note}`}
                      </p>
                    )}
                    {d.court_date && (
                      <p className="text-sm font-medium text-red-700 mt-1">Court: {new Date(d.court_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
