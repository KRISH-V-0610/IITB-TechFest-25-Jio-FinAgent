import { useNavigate, useLocation } from 'react-router-dom'
import { Check, Home, ArrowUpRight } from 'lucide-react'

const Success = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  if (!state) return <div className="p-8 text-center">Invalid State</div>
  const { transaction, recipient } = state

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">

      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-emerald-500/30">
          <Check size={48} className="text-black stroke-[3px]" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
      <p className="text-zinc-400 mb-8">Transaction ID: <span className="font-mono text-zinc-500">{transaction.id.slice(-8)}</span></p>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm space-y-6 backdrop-blur-sm">
        <div className="text-center pb-6 border-b border-zinc-800/50">
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-2">Amount Paid</p>
          <p className="text-5xl font-bold text-white">₹{transaction.amount}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-zinc-500">Paid to</span>
            <span className="text-white font-bold">{recipient.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">UPI ID</span>
            <span className="text-zinc-400 font-mono text-sm">{recipient.upiId || recipient.upi}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Date</span>
            <span className="text-zinc-400 text-sm">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8 w-full max-w-sm">
        <button
          onClick={() => navigate('/')}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Home size={18} /> Home
        </button>
        <button
          onClick={() => navigate('/search')}
          className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Pay Another <ArrowUpRight size={18} />
        </button>
      </div>

    </div>
  )
}

export default Success
