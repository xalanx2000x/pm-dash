import { supabase } from '@/lib/supabase'
import type { Task, Priority } from '@/lib/types'
import { completeTask, createTask } from '@/lib/actions'

export const dynamic = 'force-dynamic'

const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 }

async function getTasks() {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false })

  return (data ?? []).sort((a, b) => priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority])
}

export default async function TasksPage() {
  const tasks = await getTasks()

  const priorityColors: Record<Priority, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
  }

  const statusColors: Record<string, string> = {
    open: 'bg-sky-100 text-sky-700',
    in_progress: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
        <form action={async () => {
          'use server'
          await createTask('New task', 'medium')
        }}>
          <button className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
            + Add Task
          </button>
        </form>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-slate-100 rounded-xl p-12 border border-slate-200 border-dashed text-center">
          <p className="text-slate-500">No tasks yet. Add one or forward an email to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task: Task) => (
            <div key={task.id} className="bg-white rounded-xl p-5 border border-slate-200 flex items-start gap-4">
              <form action={async () => {
                'use server'
                await completeTask(task.id)
              }}>
                <button className="mt-1 w-5 h-5 rounded border-2 border-slate-300 hover:border-sky-500 transition-colors flex-shrink-0" />
              </form>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${priorityColors[task.priority as Priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[task.status] ?? ''}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">{task.category}</span>
                </div>
                <p className="font-medium text-slate-900 mt-2">{task.title}</p>
                {task.description && <p className="text-sm text-slate-600 mt-1">{task.description}</p>}
                {task.due_date && (
                  <p className="text-xs text-slate-400 mt-2">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
