import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBankStore from '../store/bankStore'
import { Landmark, ArrowRight, Loader2 } from 'lucide-react'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()

  const { login, signup, isLoading, error } = useBankStore()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLogin) {
      const res = await login(formData.email, formData.password)
      if (res.success) navigate('/')
    } else {
      const res = await signup(formData.name, formData.email, formData.password)
      if (res.success) navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-600 p-2 rounded-xl">
          <Landmark className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dummy Bank</h1>
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-600 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-600 focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-600 focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
