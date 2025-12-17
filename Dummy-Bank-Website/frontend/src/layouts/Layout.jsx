import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { Wallet, Users, History, LogOut, Search, User } from 'lucide-react'
import useBankStore from '../store/bankStore'

const Layout = () => {
  const { user, logout } = useBankStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return <Outlet />

  const navItems = [
    { path: '/', label: 'Home', icon: Wallet },
    { path: '/search', label: 'Pay', icon: Search },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/transactions', label: 'History', icon: History },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20 md:pb-0 md:pl-64">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-zinc-800 bg-zinc-950 flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Dummy<span className="text-zinc-500">Bank</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
              >
                <item.icon size={20} className={isActive ? 'text-orange-500' : ''} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <User size={16} className="text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.upiId || user.upi}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4 z-50 flex items-center justify-between">
        <span className="font-bold text-lg">Dummy<span className="text-zinc-500">Bank</span></span>
        <button onClick={handleLogout} className="text-zinc-500 hover:text-white">
          <LogOut size={20} />
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="md:p-8 pt-20 p-4 max-w-5xl mx-auto">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 w-full bg-zinc-950 border-t border-zinc-800 flex justify-around p-2 z-50 pb-safe">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive ? 'text-orange-500' : 'text-zinc-500'
                }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>

    </div>
  )
}

export default Layout
