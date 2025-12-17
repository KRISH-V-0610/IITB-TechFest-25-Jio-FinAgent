import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useBankStore from '../store/bankStore'
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react'

const Confirmation = () => {
  const { state } = useLocation()
  const { transfer, user } = useBankStore()
  const balance = user?.balance || 0
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  if (!state) return <div className="p-4 text-center">Invalid State</div>

  const { recipient, amount, note } = state
  const remainingBalance = balance - amount

  const handleConfirm = async () => {
    setIsProcessing(true)
    const result = await transfer(recipient.upiId || recipient.upi, amount, note)
    if (result.success) {
      navigate('/success', { state: { transaction: result.transaction, recipient } })
    } else {
      setError(result.error)
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
        <ArrowRight className="rotate-180" size={16} />
        Back to Edit
      </button>
      <h1 className="text-2xl font-bold text-white mb-8 text-center">Confirm Payment</h1>

      {/* SUMMARY CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* ALERT BANNER */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>

        <div className="text-center pb-6 border-b border-zinc-800">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">You are paying</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-4xl font-bold text-white">₹{amount}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-sm">To</span>
            <div className="text-right">
              <p className="font-bold text-white">{recipient.name}</p>
              <p className="text-xs text-zinc-500">{recipient.upiId || recipient.upi}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-sm">Note</span>
            <span className="text-zinc-300 text-sm italic">{note || '—'}</span>
          </div>

          <div className="bg-zinc-950 rounded-xl p-4 flex justify-between items-center border border-zinc-800/50">
            <div className="text-xs">
              <p className="text-zinc-500">Wallet Balance</p>
              <p className="text-zinc-400">After payment</p>
            </div>
            <span className="font-mono font-bold text-emerald-500">₹{remainingBalance}</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              Confirm Payment <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-zinc-500 text-xs">
        <ShieldAlert size={14} />
        <p>Secure 256-bit Connection</p>
      </div>
    </div>
  )
}

export default Confirmation
