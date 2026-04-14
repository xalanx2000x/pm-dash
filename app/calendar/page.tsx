import { supabase } from '@/lib/supabase'
import type { CalendarEvent } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getEvents() {
  if (!supabase) return []
  const { data } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('date', { ascending: true })

  return data ?? []
}

const typeConfig: Record<string, { label: string; emoji: string; color: string }> = {
  move_in: { label: 'Move In', emoji: '🧳', color: 'bg-green-100 border-green-200 text-green-800' },
  move_out: { label: 'Move Out', emoji: '🚚', color: 'bg-orange-100 border-orange-200 text-orange-800' },
  lease_end: { label: 'Lease End', emoji: '📋', color: 'bg-amber-100 border-amber-200 text-amber-800' },
  vendor: { label: 'Vendor', emoji: '🔧', color: 'bg-blue-100 border-blue-200 text-blue-800' },
  legal: { label: 'Legal', emoji: '⚖️', color: 'bg-red-100 border-red-200 text-red-800' },
  other: { label: 'Other', emoji: '📌', color: 'bg-slate-100 border-slate-200 text-slate-700' },
}

export default async function CalendarPage() {
  const events = await getEvents()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Group by month
  const grouped: Record<string, CalendarEvent[]> = {}
  for (const event of events) {
    const month = new Date(event.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(event)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>

      {events.length === 0 ? (
        <div className="bg-slate-100 rounded-xl p-12 border border-slate-200 border-dashed text-center">
          <p className="text-slate-500">No events yet. OpenClaw adds calendar items from Yardi reports and email input.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{month}</h2>
            <div className="space-y-2">
              {monthEvents.map((event: CalendarEvent) => {
                const config = typeConfig[event.type] ?? typeConfig.other
                const eventDate = new Date(event.date)
                eventDate.setHours(0, 0, 0, 0)
                const isPast = eventDate < today
                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-xl p-4 border flex items-center gap-4 ${config.color} ${isPast ? 'opacity-50' : ''}`}
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      {event.unit && <p className="text-sm opacity-80">Unit {event.unit}</p>}
                      {event.description && <p className="text-sm opacity-80 mt-1">{event.description}</p>}
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap">
                      {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
