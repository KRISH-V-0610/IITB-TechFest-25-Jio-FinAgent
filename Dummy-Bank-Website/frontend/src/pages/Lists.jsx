import useBankStore from '../store/bankStore'
import { User, ArrowUpRight, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export const Contacts = () => {
  const { contacts } = useBankStore()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors group">
          <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Contacts</h1>
      </div>

      <div className="grid gap-3">
        {(!contacts || contacts.length === 0) ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-zinc-500" size={24} />
            </div>
            <p className="text-zinc-400 font-medium">No saved contacts</p>
            <p className="text-zinc-600 text-sm mt-1">Add people by sending them money</p>
          </div>
        ) : (
          contacts.map(contact => (
            <div key={contact._id || contact.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                  <User className="text-zinc-400" size={20} />
                </div>
                <div>
                  <p className="font-medium text-white">{contact.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{contact.upiId || contact.upi}</p>
                </div>
              </div>
              <Link
                to="/transfer"
                state={{ recipient: contact }}
                className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Pay
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export const Transactions = () => {
  const { transactions } = useBankStore()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowRight className="rotate-180" size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
      </div>

      <div className="space-y-3">
        {(!transactions || transactions.length === 0) ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-zinc-500">No transactions yet</p>
          </div>
        ) : (
          transactions.map(txn => (
            <div key={txn.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
              <div className="flex gap-4">
                <div className={`p-2 rounded-lg ${txn.type === 'debit' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <ArrowUpRight className={txn.type === 'debit' ? '' : 'rotate-180'} />
                </div>
                <div>
                  <p className="font-bold text-white">
                    {txn.type === 'debit' ? `Paid to ${txn.toUpi}` : `Received from ${txn.fromUpi}`}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">{txn.id} • {new Date(txn.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div className={`font-mono font-bold ${txn.type === 'debit' ? 'text-white' : 'text-emerald-500'}`}>
                {txn.type === 'debit' ? '-' : '+'}₹{txn.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
