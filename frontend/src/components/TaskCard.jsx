import { useState } from 'react'

const priorityStyles = {
  HIGH:   'bg-red-900/40 text-red-400 border border-red-800',
  MEDIUM: 'bg-amber-900/40 text-amber-400 border border-amber-800',
  LOW:    'bg-green-900/40 text-green-400 border border-green-800'
}

export default function TaskCard({ task, onDelete, onMove }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(task.id)
    setDeleting(false)
  }

  const statuses = ['TODO', 'IN_PROGRESS', 'DONE']
  const currentIdx = statuses.indexOf(task.status)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 group hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm text-white font-medium leading-snug">{task.title}</p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {currentIdx > 0 && (
            <button
              onClick={() => onMove(task.id, statuses[currentIdx - 1])}
              className="text-xs text-gray-500 hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-800 transition-colors"
              title="Move left"
            >
              ←
            </button>
          )}
          {currentIdx < statuses.length - 1 && (
            <button
              onClick={() => onMove(task.id, statuses[currentIdx + 1])}
              className="text-xs text-gray-500 hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-800 transition-colors"
              title="Move right"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
