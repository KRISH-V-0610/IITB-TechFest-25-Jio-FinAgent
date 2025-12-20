import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, ArrowRight, X } from 'lucide-react'
import useBankStore from '../store/bankStore'

const SearchUser = () => {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [isQuerying, setIsQuerying] = useState(false)
  const navigate = useNavigate()
  const { searchUser, addContact, contacts, user: currentUser } = useBankStore()

  const handleSearch = async (val) => {
    setQuery(val)
    if (val.length > 2) {
      setIsQuerying(true)
      const res = await searchUser(val)
      setUsers(res.filter(u => u.upiId !== currentUser.upiId))
    } else {
      setIsQuerying(false)
      setUsers([])
    }
  }

  const isContact = (id) => contacts.some(c => c._id === id)

  // Show Contacts if no search
  const displayResults = isQuerying ? users : contacts

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5">
          <ArrowRight className="rotate-180" size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold">Send Money</h1>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input
          type="text"
          placeholder="Enter Name, UPI ID or Phone"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-brand-primary transition-all text-lg placeholder:text-zinc-600"
          autoFocus
        />
        {query && (
          <button onClick={() => handleSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* RESULTS LIST */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2">
          {isQuerying ? 'Search Results' : 'Saved Contacts'}
        </h3>

        {displayResults.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/30 border-dashed">
            {isQuerying ? 'No users found' : 'No saved contacts yet'}
          </div>
        ) : (
          displayResults.map(u => (
            <div key={u._id} className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-lg font-bold border border-zinc-600 text-white shadow-inner">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white group-hover:text-brand-primary transition-colors">{u.name}</p>
                  <p className="text-sm text-zinc-500 font-mono">{u.upiId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isContact(u._id) && currentUser.upiId !== u.upiId && (
                  <button
                    onClick={(e) => { e.stopPropagation(); addContact(u._id); }}
                    className="p-3 bg-zinc-800 rounded-xl text-zinc-400 hover:text-brand-primary hover:bg-zinc-700 transition-colors"
                  >
                    <UserPlus size={18} />
                  </button>
                )}
                <button
                  onClick={() => navigate('/transfer', { state: { to: u } })}
                  className="px-5 py-3 bg-white text-black font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-lg shadow-white/5"
                >
                  Pay
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SearchUser
