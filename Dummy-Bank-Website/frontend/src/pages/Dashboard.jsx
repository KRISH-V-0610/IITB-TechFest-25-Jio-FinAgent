import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useBankStore from '../store/bankStore'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Plus,
  CreditCard,
  Smartphone,
  Zap,
  Coins,
  ChevronRight,
  Wifi
} from 'lucide-react'

const Dashboard = () => {
  const { user, transactions, fetchInitialData } = useBankStore()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const currentBalance = user?.balance || 0
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(currentBalance)

  const recentTxns = transactions.slice(0, 4)

  return (
    <div className="space-y-8 animate-fade-in">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Dashboard
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
        <Link to="/search" className="hidden md:flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5">
          <ArrowUpRight size={18} /> Send Money
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: CARD & ACTIONS */}
        <div className="lg:col-span-2 space-y-6">

          {/* PREMIUM CARD VISUAL */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl p-8 h-[240px] flex flex-col justify-between group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-brand-primary/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-zinc-400 font-medium text-sm tracking-wider uppercase mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold text-white tracking-tight">{formattedBalance}</h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center backdrop-blur-md">
                <Wifi className="text-zinc-400 rotate-90" size={24} />
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-12 bg-gradient-to-tr from-yellow-200 to-yellow-500 rounded-md opacity-80"></div>
                <span className="font-mono text-zinc-500 tracking-widest text-lg">•••• •••• •••• 1234</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Card Holder</p>
                  <p className="text-sm font-bold text-zinc-200 uppercase tracking-wider">{user?.name}</p>
                </div>
                <p className="text-xs font-bold text-white italic">VISA</p>
              </div>
            </div>
          </div>

          {/* QUICK SERVICES */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Quick Services</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              <ServiceLink to="/services/mobile-recharge" icon={Smartphone} label="Recharge" color="blue" />
              <ServiceLink to="/services/electricity" icon={Zap} label="Electricity" color="yellow" />
              <ServiceLink to="/services/gold" icon={Coins} label="Gold" color="orange" />
              <ServiceLink to="/contacts" icon={Plus} label="More" color="zinc" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT TXNS */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Activity</h3>
            <Link to="/transactions" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="space-y-1 flex-1">
            {recentTxns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 gap-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              recentTxns.map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${txn.type === 'credit'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-zinc-800/50 border-zinc-700/50 text-white'
                      }`}>
                      {txn.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white group-hover:text-brand-primary transition-colors">
                        {txn.recipient || (txn.type === 'credit' ? txn.fromName : txn.toName) || 'Unknown'}
                      </p>
                      <p className="text-xs text-zinc-500">{new Date(txn.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-sm ${txn.type === 'credit' ? 'text-emerald-500' : 'text-zinc-200'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                  </span>
                </div>
              ))
            )}
          </div>
          <Link to="/search" className="mt-4 md:hidden flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold w-full">
            <ArrowUpRight size={18} /> Send Money
          </Link>
        </div>

      </div>
    </div>
  )
}

const ServiceLink = ({ to, icon: Icon, label, color }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white',
    yellow: 'text-yellow-500 bg-yellow-500/10 group-hover:bg-yellow-500 group-hover:text-black',
    orange: 'text-orange-500 bg-orange-500/10 group-hover:bg-orange-500 group-hover:text-white',
    zinc: 'text-zinc-400 bg-zinc-800 group-hover:bg-white group-hover:text-black',
  }

  return (
    <Link to={to} className="flex flex-col items-center gap-3 group p-2">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">{label}</span>
    </Link>
  )
}

export default Dashboard
