import { useState } from 'react'

export default function AddTaskModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">New task</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Title</label>
            <input
              type="text"
              required
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Description <span className="text-gray-600">(optional)</span></label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors text-sm resize-none"
              placeholder="Add more details..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
            <div className="flex gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    form.priority === p
                      ? p === 'HIGH' ? 'bg-red-900/60 border-red-700 text-red-300'
                        : p === 'MEDIUM' ? 'bg-amber-900/60 border-amber-700 text-amber-300'
                        : 'bg-green-900/60 border-green-700 text-green-300'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-sm transition-colors"
            >
              {loading ? 'Adding...' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
