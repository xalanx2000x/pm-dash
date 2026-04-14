import { supabase } from '@/lib/supabase'
import type { Vendor } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getVendors() {
  if (!supabase) return []
  const { data } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-blue-800', bg: 'bg-blue-100 border-blue-200' },
  overdue: { label: 'Overdue', color: 'text-red-800', bg: 'bg-red-100 border-red-200' },
  on_hold: { label: 'On Hold', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
  completed: { label: 'Completed', color: 'text-green-800', bg: 'bg-green-100 border-green-200' },
}

export default async function VendorsPage() {
  const vendors = await getVendors()
  const active = vendors.filter((v: Vendor) => v.status === 'active' || v.status === 'overdue')
  const done = vendors.filter((v: Vendor) => v.status === 'completed' || v.status === 'on_hold')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Vendors</h1>

      {active.length === 0 && done.length === 0 ? (
        <div className="bg-slate-100 rounded-xl p-12 border border-slate-200 border-dashed text-center">
          <p className="text-slate-500">No vendor projects yet. OpenClaw will add them as you coordinate work.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Projects</h2>
              {active.map((v: Vendor) => {
                const s = statusConfig[v.status]
                return (
                  <div key={v.id} className="bg-white rounded-xl p-5 border border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                          <span className="text-xs text-slate-400">{v.trade}</span>
                        </div>
                        <p className="font-semibold text-slate-900 mt-2">{v.name}</p>
                        {v.project_description && <p className="text-sm text-slate-600 mt-1">{v.project_description}</p>}
                      </div>
                      <div className="text-right text-sm">
                        {v.scheduled_date && (
                          <p className="text-slate-600">
                            {v.status === 'overdue' ? '⏰ Was due: ' : 'Scheduled: '}
                            {new Date(v.scheduled_date).toLocaleDateString()}
                          </p>
                        )}
                        {v.phone && <p className="text-slate-500 mt-1">{v.phone}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {done.length > 0 && (
            <div className="space-y-3 mt-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Completed / On Hold</h2>
              {done.map((v: Vendor) => {
                const s = statusConfig[v.status]
                return (
                  <div key={v.id} className="bg-white rounded-xl p-5 border border-slate-200 opacity-60">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                        <p className="font-medium text-slate-900 mt-2">{v.name}</p>
                        <p className="text-sm text-slate-500">{v.trade}</p>
                      </div>
                      {v.completed_date && (
                        <p className="text-xs text-slate-400">Done {new Date(v.completed_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
