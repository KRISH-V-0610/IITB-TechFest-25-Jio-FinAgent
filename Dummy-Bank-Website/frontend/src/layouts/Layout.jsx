import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useBankStore from '../store/bankStore'
import {
  Home,
  Send,
  Users,
  History,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Wallet,
  Smartphone,
  Zap,
  Coins
} from 'lucide-react'

const Layout = () => {
  const { user, logout } = useBankStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Send, label: 'Transfer', path: '/search' }, // Taking to search as entry point
    { icon: History, label: 'History', path: '/transactions' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
  ]

  const serviceItems = [
    { icon: Smartphone, label: 'Recharge', path: '/services/mobile-recharge' },
    { icon: Zap, label: 'Electricity', path: '/services/electricity' },
    { icon: Coins, label: 'Gold', path: '/services/gold' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden font-display selection:bg-brand-primary selection:text-white">

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Wallet className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">FinAgent</h1>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Banking</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar py-4">
          {/* Main Nav */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Menu</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                  ? 'bg-zinc-900 border border-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
              >
                <item.icon size={20} className={isActive(item.path) ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-zinc-300'} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive(item.path) && <ChevronRight size={14} className="ml-auto text-zinc-600" />}
              </Link>
            ))}
          </div>

          {/* Services Nav */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Quick Services</p>
            {serviceItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                  ? 'bg-zinc-900 border border-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
              >
                <item.icon size={20} className={isActive(item.path) ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-zinc-300'} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
          <Link to="/settings" className="bg-[var(--bg-tertiary)] rounded-xl p-4 flex items-center gap-3 border border-[var(--border-color)] hover:border-brand-primary/50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-sm font-bold border border-zinc-600 text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate text-[var(--text-primary)]">{user?.name}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">Settings & Profile</p>
            </div>
            <div className="text-[var(--text-secondary)] group-hover:text-brand-primary transition-colors p-1">
              <ChevronRight size={18} />
            </div>
          </Link>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center">
            <Wallet className="text-white" size={16} />
          </div>
          <span className="font-bold text-lg">FinAgent</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-zinc-950 pt-20 px-6 space-y-6 animate-in slide-in-from-top-10 fade-in duration-200">
          <div className="grid grid-cols-2 gap-3">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} className="bg-zinc-900 p-4 rounded-xl flex flex-col items-center gap-2 border border-zinc-800">
                <item.icon className="text-brand-primary" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Services</p>
            <div className="space-y-2">
              {serviceItems.map(item => (
                <Link key={item.path} to={item.path} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <item.icon size={18} className="text-zinc-400" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-4 text-red-400 font-medium flex items-center justify-center gap-2 bg-zinc-900 rounded-xl">
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative w-full pt-20 md:pt-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
