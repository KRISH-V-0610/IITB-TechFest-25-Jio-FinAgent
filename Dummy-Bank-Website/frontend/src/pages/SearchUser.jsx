import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useBankStore from '../store/bankStore'
import { Search, User, ArrowRight, Loader2, UserPlus, Check } from 'lucide-react'

const SearchUser = () => {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const { searchUser, contacts } = useBankStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Simple debounce integration
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true)
        const results = await searchUser(query)
        setSearchResults(results)
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query, searchUser])

  const displayResults = query ? searchResults : contacts
  const isQuerying = !!query

  const handleSelectUser = (user) => {
    navigate('/transfer', { state: { recipient: user } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowRight className="rotate-180" size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Send Money</h1>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative">
        {isSearching ? (
          <Loader2 className="absolute left-4 top-3.5 text-orange-500 animate-spin" size={20} />
        ) : (
          <Search className="absolute left-4 top-3.5 text-zinc-500" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Name or UPI ID"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
          autoFocus
        />
      </div>

      {/* RECENT PAYMENTS & CONTACTS */}
      {!isQuerying && (
        <div className="space-y-6">
          {/* RECENT PAYMENTS */}
          <div>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Recent</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {(() => {
                const { transactions } = useBankStore.getState();
                const recents = transactions
                  .filter(t => t.type === 'debit')
                  .reduce((acc, current) => {
                    const x = acc.find(item => item.toUpi === current.toUpi);
                    if (!x) {
                      return acc.concat([current]);
                    } else {
                      return acc;
                    }
                  }, [])
                  .slice(0, 5); // Top 5 unique

                if (recents.length === 0) return <p className="text-zinc-500 text-sm italic">No recent payments</p>;

                return recents.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectUser({ name: t.toName, upi: t.toUpi })} // Assuming logic handles this object shape
                    className="flex flex-col items-center gap-2 min-w-[80px]"
                  >
                    <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-800 hover:border-orange-500 transition-colors flex items-center justify-center text-xl font-bold text-white uppercase">
                      {t.toName[0]}
                    </div>
                    <span className="text-xs text-zinc-400 font-medium truncate w-full text-center">{t.toName.split(' ')[0]}</span>
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* RESULTS LIST */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
          {isQuerying ? 'Search Results' : 'Saved Contacts'}
        </h2>

        {displayResults.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 space-y-4">
            <p>{isQuerying ? 'No users found matched your search.' : 'No saved contacts'}</p>
            {isQuerying && (
              <button
                onClick={() => handleSelectUser({ name: 'Unknown Recipient', upi: query })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors border border-zinc-700"
              >
                Pay to UPI ID: <span className="font-mono text-orange-400">{query}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        ) : (
          displayResults.map(user => {
            const isContact = contacts.some(c => c._id === user._id || c._id === user.id);
            return (
              <div
                key={user._id || user.id}
                className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800/50 rounded-xl transition-all group"
              >
                <div onClick={() => handleSelectUser(user)} className="flex items-center gap-4 cursor-pointer flex-grow">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                    <User size={20} className="text-zinc-400 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{user.upiId || user.upi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* ADD CONTACT BUTTON (Only show if searching and not already a contact) */}
                  {isQuerying && !isContact && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigating to transfer
                        useBankStore.getState().addContact(user._id || user.id);
                      }}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                      title="Add to Contacts"
                    >
                      <UserPlus size={18} />
                    </button>
                  )}

                  {/* SHOW ADDED STATUS */}
                  {isQuerying && isContact && (
                    <div className="p-2 text-emerald-500" title="Saved">
                      <Check size={18} />
                    </div>
                  )}

                  <button
                    onClick={() => handleSelectUser(user)}
                    className="bg-orange-600/10 text-orange-600 p-2 rounded-lg hover:bg-orange-600 hover:text-white transition-all"
                    title="Pay"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SearchUser
