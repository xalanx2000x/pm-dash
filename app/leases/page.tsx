import { supabase } from '@/lib/supabase'
import type { Lease } from '@/lib/types'

async function getLeases() {
  const { data } = await supabase
    .from('leases')
    .select('*')
    .order('lease_end_date', { ascending: true })

  return data ?? []
}

function getExpiryTag(lease: Lease): { label: string; className: string } {
  const today = new Date()
  const end = new Date(lease.lease_end_date)
  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { label: 'Expired', className: 'bg-red-100 text-red-800 border border-red-200' }
  if (daysLeft <= 30) return { label: `${daysLeft}d — critical`, className: 'bg-red-100 text-red-800 border border-red-200' }
  if (daysLeft <= 60) return { label: `${daysLeft}d — warning`, className: 'bg-orange-100 text-orange-800 border border-orange-200' }
  if (daysLeft <= 90) return { label: `${daysLeft}d — notice`, className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' }
  return { label: `${daysLeft}d`, className: 'bg-slate-100 text-slate-600 border border-slate-200' }
}

export default async function LeasesPage() {
  const leases = await getLeases()
  const today = new Date().toISOString().split('T')[0]

  const active = leases.filter(l => l.status === 'active' || l.status === 'expiring')
  const expired = leases.filter(l => l.status === 'expired')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Leases</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>{active.filter((l: any) => new Date(l.lease_end_date) <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)).length}</strong> leases expiring in the next 60 days
        </p>
      </div>

      <div className="space-y-3">
        {active.map((lease: Lease) => {
          const tag = getExpiryTag(lease)
          return (
            <div key={lease.id} className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${tag.className}`}>{tag.label}</span>
                </div>
                <p className="font-semibold text-slate-900 mt-2">Unit {lease.unit}</p>
                <p className="text-sm text-slate-600">{lease.resident_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">${lease.monthly_rent.toLocaleString()}/mo</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ends {new Date(lease.lease_end_date).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-400">Move-in: {new Date(lease.move_in_date).toLocaleDateString()}</p>
              </div>
            </div>
          )
        })}
      </div>

      {expired.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-slate-700 mt-8">Expired</h2>
          <div className="space-y-3">
            {expired.map((lease: Lease) => (
              <div key={lease.id} className="bg-white rounded-xl p-5 border border-red-200 opacity-60 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Unit {lease.unit}</p>
                  <p className="text-sm text-slate-600">{lease.resident_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600">Expired {new Date(lease.lease_end_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
