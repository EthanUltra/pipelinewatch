import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, api } from '../store/auth'
import Column from '../components/Column'
import AddTaskModal from '../components/AddTaskModal'

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']

export default function Board() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks')
      setTasks(data.tasks)
    } catch {
      logout()
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (form) => {
    const { data } = await api.post('/tasks', form)
    setTasks(prev => [data.task, ...prev])
  }

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const moveTask = async (id, status) => {
    const { data } = await api.patch(`/tasks/${id}`, { status })
    setTasks(prev => prev.map(t => t.id === id ? data.task : t))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const totalDone = tasks.filter(t => t.status === 'DONE').length

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-mono text-xs font-bold">PW</span>
          </div>
          <span className="text-white font-semibold">PipelineWatch</span>
          <span className="hidden sm:inline text-gray-700 mx-1">·</span>
          <span className="hidden sm:inline text-sm text-gray-500">
            {totalDone}/{tasks.length} tasks done
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">My Board</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New task
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex gap-6 pb-6">
            {STATUSES.map(status => (
              <Column
                key={status}
                status={status}
                tasks={tasks.filter(t => t.status === status)}
                onDelete={deleteTask}
                onMove={moveTask}
                onAdd={() => setShowModal(true)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddTaskModal onClose={() => setShowModal(false)} onSubmit={addTask} />
      )}
    </div>
  )
}
