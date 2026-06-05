import TaskCard from './TaskCard'

const columnMeta = {
  TODO:        { label: 'To Do',      color: 'bg-gray-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-violet-500' },
  DONE:        { label: 'Done',        color: 'bg-green-500' }
}

export default function Column({ status, tasks, onDelete, onMove, onAdd }) {
  const meta = columnMeta[status]

  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${meta.color}`}></div>
          <h2 className="text-sm font-semibold text-gray-300">{meta.label}</h2>
          <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        {status === 'TODO' && (
          <button
            onClick={onAdd}
            className="text-gray-500 hover:text-violet-400 transition-colors"
            title="Add task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 min-h-[200px]">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-gray-800 rounded-xl h-24 flex items-center justify-center">
            <p className="text-xs text-gray-700">No tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}
