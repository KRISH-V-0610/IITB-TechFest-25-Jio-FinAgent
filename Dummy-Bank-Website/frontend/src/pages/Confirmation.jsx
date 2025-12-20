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
  const [pin, setPin] = useState('')

  if (!state) return <div className="p-4 text-center">Invalid State</div>

  /* Logic for Transfer */
  const handleConfirm = async () => {
    if (!pin || pin.length !== 4) {
      setError('Please enter your 4-digit PIN')
      return;
    }
    setIsProcessing(true)

    // We debit the TOTAL amount (including fees/tax)
    const result = await transfer(recipient.upiId || recipient.upi, totalAmount, note, pin, category)

    if (result.success) {
      navigate('/success', { state: { transaction: result.transaction, recipient } })
    } else {
      setError(result.error)
      setIsProcessing(false)
    }
  }

  const { recipient, amount, note, category, fee, tax, isGold } = state
  const totalAmount = (parseFloat(amount) + (parseFloat(fee) || 0) + (parseFloat(tax) || 0)).toFixed(2)
  const remainingBalance = (balance - totalAmount).toFixed(2)

  return (
    <div className="max-w-md mx-auto py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5">
        <ArrowRight className="rotate-180" size={18} /> Back to Edit
      </button>
      <h1 className="text-2xl font-bold text-white mb-2 text-center">Confirm Payment</h1>
      {isGold && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20 animate-pulse">
            Price valid for 04:59
          </div>
        </div>
      )}

      {/* SUMMARY CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* ALERT BANNER */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>

        <div className="text-center pb-6 border-b border-zinc-800">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">Total Payable</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-4xl font-bold text-white">₹{totalAmount}</span>
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

          {/* BREAKDOWN */}
          <div className="border-t border-zinc-800/50 pt-2 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Amount</span>
              <span className="text-zinc-300">₹{parseFloat(amount).toFixed(2)}</span>
            </div>
            {fee > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Convenience Fee</span>
                <span className="text-zinc-300">+₹{parseFloat(fee).toFixed(2)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">GST (3%)</span>
                <span className="text-zinc-300">+₹{parseFloat(tax).toFixed(2)}</span>
              </div>
            )}
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

        <div className="pt-2">
          <label className="block text-center text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Enter 4-Digit PIN</label>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
              setError('')
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-orange-500 transition-colors placeholder:tracking-normal"
            placeholder="••••"
          />
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
