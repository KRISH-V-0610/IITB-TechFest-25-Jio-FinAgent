import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useBankStore from '../store/bankStore'
import { User, IndianRupee, ArrowRight } from 'lucide-react'

const Transfer = () => {
  const { state } = useLocation()
  const { user } = useBankStore()
  const balance = user?.balance || 0
  const navigate = useNavigate()

  const recipient = state?.recipient

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!recipient) {
      navigate('/search')
    }
  }, [recipient, navigate])

  if (!recipient) {
    return null
  }

  const handleProceed = (e) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || val <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (val > balance) {
      setError('Insufficient wallet balance')
      return
    }

    // Navigate to Confirmation (High Risk Step)
    navigate('/confirmation', {
      state: {
        recipient,
        amount: val,
        note
      }
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors py-2 px-1 mb-4 group"
      >
        <div className="p-2 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
          <ArrowRight className="rotate-180" size={20} />
        </div>
        <span className="font-medium">Back</span>
      </button>

      {/* RECIPIENT CARD */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center mb-4 text-2xl font-bold text-white shadow-lg shadow-orange-900/40">
          {recipient.name[0]}
        </div>
        <h2 className="text-xl font-bold text-white text-center">Paying {recipient.name}</h2>
        <p className="text-zinc-500 font-mono text-sm">{recipient.upiId || recipient.upi}</p>
      </div>

      {/* AMOUNT INPUT FORM */}
      <form onSubmit={handleProceed} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-center text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Enter Amount</label>
          <div className="relative max-w-[200px] mx-auto">
            <IndianRupee size={32} className="absolute left-0 top-1/2 -translate-y-1/2 text-white" />
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError('')
              }}
              placeholder="0"
              className="w-full bg-transparent text-5xl font-bold text-white text-center focus:outline-none placeholder:text-zinc-700 no-spinners pl-8"
              autoFocus
            />
          </div>
        </div>

        {error && <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">{error}</div>}

        <div className="px-4 py-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-sm">
          <span className="text-zinc-500">From Wallet Balance</span>
          <span className="text-white font-mono">₹{balance}</span>
        </div>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600 text-center"
        />

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-900/20 active:scale-[0.98]"
        >
          Proceed to Pay
        </button>
      </form>
    </div>
  )
}

export default Transfer
