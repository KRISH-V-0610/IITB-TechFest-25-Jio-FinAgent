import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Home, UserPlus, Check } from 'lucide-react'
import useBankStore from '../store/bankStore'

const Success = () => {
  const { state } = useLocation()
  const { contacts, addContact } = useBankStore()
  const [isSaved, setIsSaved] = useState(false)

  if (!state) return <div className="p-10 text-center text-white">Transaction Complete</div>

  const { transaction, recipient } = state

  const isContactAlready = contacts?.some(c => c._id === recipient._id || c._id === recipient.id)

  const handleSaveContact = async () => {
    const res = await addContact(recipient._id || recipient.id)
    if (res.success) {
      setIsSaved(true)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 animate-bounce-slow">
        <CheckCircle2 size={48} className="text-emerald-500" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Payment Successful</h1>
      <p className="text-zinc-400 mb-8">Transaction ID: <span className="font-mono text-zinc-300">{transaction.id}</span></p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm mb-8">
        <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1">Items Paid</p>
        <p className="text-4xl font-bold text-white mb-6">₹{transaction.amount}</p>

        <div className="flex items-center justify-center gap-2 text-zinc-300">
          <span>To</span>
          <span className="font-bold">{recipient.name}</span>
        </div>
        <p className="text-zinc-500 text-sm font-mono mt-1">{recipient.upiId || recipient.upi}</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 font-bold px-8 py-3 rounded-xl transition-colors w-full"
        >
          <Home size={18} />
          Back to Home
        </Link>

        {!isContactAlready && !isSaved && (
          <button
            onClick={handleSaveContact}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-8 py-3 rounded-xl transition-colors w-full border border-zinc-700"
          >
            <UserPlus size={18} />
            Add to Contacts
          </button>
        )}

        {isSaved && (
          <button disabled className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 font-medium px-8 py-3 rounded-xl w-full border border-emerald-500/20 cursor-default">
            <Check size={18} />
            Saved to Contacts
          </button>
        )}
      </div>
    </div>
  )
}

export default Success
