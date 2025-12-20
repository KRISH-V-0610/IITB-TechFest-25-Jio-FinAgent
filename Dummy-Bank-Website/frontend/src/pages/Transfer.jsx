import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import useBankStore from '../store/bankStore'

const Transfer = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useBankStore()

  if (!state?.to) return <div className="p-8 text-center text-zinc-500">No recipient selected</div>

  const recipient = state.to
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const handleNext = () => {
    const val = parseFloat(amount)
    if (val > 0 && val <= user.balance) {
      navigate('/confirmation', { state: { recipient, amount: val, note, category: 'TRANSFER' } })
    }
  }

  return (
    <div className="max-w-md mx-auto py-10 animate-fade-in text-center">

      {/* RECIPIENT HEADER */}
      {/* RECIPIENT HEADER */}
      <div className="mb-10 relative">
        <button onClick={() => navigate(-1)} className="absolute left-0 top-0 flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5 z-10">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-2xl font-bold border border-zinc-600 text-white shadow-lg mx-auto mb-4 mt-8 md:mt-0">
          {recipient.name.charAt(0)}
        </div>
        <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold mb-1">Paying to</p>
        <h1 className="text-2xl font-bold text-white">{recipient.name}</h1>
        <p className="text-zinc-500 font-mono mt-1">{recipient.upiId}</p>
      </div>

      {/* HUGE AMOUNT INPUT */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-1 text-white">
          <span className="text-4xl font-bold text-zinc-500">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className="bg-transparent text-6xl md:text-7xl font-bold w-[250px] text-center focus:outline-none placeholder:text-zinc-800"
          />
        </div>
        {amount > user.balance && (
          <p className="text-red-500 text-sm font-bold mt-4 bg-red-500/10 inline-block px-3 py-1 rounded-full border border-red-500/20">
            Insufficient Balance: ₹{user.balance}
          </p>
        )}
      </div>

      {/* NOTE INPUT */}
      <div className="max-w-xs mx-auto mb-10">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's this for?"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-center text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-zinc-600"
        />
      </div>

      {/* ACTION */}
      <button
        onClick={handleNext}
        disabled={!amount || amount <= 0 || amount > user.balance}
        className="w-full max-w-xs bg-white text-black font-bold py-4 rounded-full hover:scale-105 transition-all shadow-lg shadow-white/10 disabled:opacity-50 disabled:hover:scale-100"
      >
        Proceed to Pay
      </button>

    </div>
  )
}

export default Transfer
