import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBankStore from '../store/bankStore'
import { Wallet, ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')

  const navigate = useNavigate()
  const { login, signup, isLoading, error } = useBankStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    let res
    if (isLogin) {
      res = await login(email, password)
    } else {
      res = await signup(name, email, password, pin)
    }

    if (res.success) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 animate-fade-in">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-primary/20">
            <Wallet className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">FinAgent</h1>
          <p className="text-zinc-400">Next Gen Banking for the Future</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-600"
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="password"
                placeholder="Set 4-Digit PIN"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-600"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-accent hover:to-brand-primary text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-primary/20 mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
