import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useBankStore from '../store/bankStore'
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Search, Plus } from 'lucide-react'

const Dashboard = () => {
  const { user, balance, transactions, fetchInitialData } = useBankStore()

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Balance from user object (updated via store)
  const currentBalance = user?.balance || 0

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(currentBalance)

  const recentTxns = transactions.slice(0, 3)

  // Calculate income/spending from transactions (simple estimation for UI)
  const income = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  const spending = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">

      {/* WELCOME BLOCK */}
      <h1 className="text-2xl font-bold text-white">
        Hello, <span className="text-orange-500">{user?.name}</span>
      </h1>

      {/* BALANCE CARD */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        
        <div className="relative z-10">
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Total Balance</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">{formattedBalance}</h2>

          <div className="flex gap-3">
            <Link to="/search" className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-orange-900/20">
              <ArrowUpRight size={18} />
              Send Money
            </Link>
            <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all border border-zinc-700 cursor-not-allowed opacity-60">
              <Plus size={18} />
              Add Money
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <ArrowDownLeft size={16} />
            <span className="text-xs font-bold uppercase">Income</span>
          </div>
          <p className="text-xl font-bold text-white">₹{income}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <ArrowUpRight size={16} />
            <span className="text-xs font-bold uppercase">Spending</span>
          </div>
          <p className="text-xl font-bold text-white">₹{spending}</p>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm text-orange-500 hover:text-orange-400">View All</Link>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {recentTxns.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No transactions yet</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recentTxns.map(txn => (
                <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}>
                      {txn.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{txn.type === 'credit' ? 'Received' : 'Paid to'} {txn.type === 'credit' ? txn.fromUpi : txn.toUpi}</p>
                      <p className="text-xs text-zinc-500">{new Date(txn.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold font-mono ${txn.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Dashboard
