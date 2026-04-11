import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-mono text-sm font-bold">PW</span>
            </div>
            <span className="text-white font-semibold text-lg">PipelineWatch</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your board</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-6 text-center">
          No account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300">Create one</Link>
        </p>

        <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 font-mono mb-2">// CI/CD pipeline status</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-gray-400">tests passing</span>
            <span className="text-gray-700 mx-1">·</span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-gray-400">lint clean</span>
            <span className="text-gray-700 mx-1">·</span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-gray-400">deployed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
