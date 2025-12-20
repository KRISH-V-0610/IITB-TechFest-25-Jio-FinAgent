import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, LogOut, ChevronRight, Save, X, Edit2, Lock, Mail } from 'lucide-react'
import useBankStore from '../store/bankStore'

const Settings = () => {
  const navigate = useNavigate()
  const { user, logout, updateProfile, isLoading, error } = useBankStore()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    pin: ''
  })
  const [msg, setMsg] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSave = async () => {
    const res = await updateProfile(formData.name, formData.email, formData.pin || undefined)
    if (res.success) {
      setIsEditing(false)
      setMsg('Profile updated successfully!')
      setTimeout(() => setMsg(''), 3000)
      setFormData(prev => ({ ...prev, pin: '' })) // Clear PIN
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      pin: ''
    })
    setMsg('')
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-10">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5">
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-sm font-bold border border-zinc-800 hover:bg-zinc-800 transition-colors"
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {msg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-center font-bold">
          {msg}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center font-bold">
          {error}
        </div>
      )}

      {/* PROFILE FORM */}
      <div className="glass-card rounded-3xl p-8 space-y-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-4xl font-bold text-white shadow-xl mb-4 relative group">
            {user?.name?.charAt(0)}
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-not-allowed">
                <span className="text-xs">Change</span>
              </div>
            )}
          </div>
          {!isEditing && (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{user?.name}</h2>
              <div className="mt-2 text-xs font-mono bg-zinc-800/50 text-zinc-500 inline-block px-3 py-1 rounded-full border border-zinc-700/30">
                UPI: {user?.upiId}
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {/* NAME */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full bg-zinc-900/50 border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none transition-all ${isEditing
                  ? 'border-zinc-700 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
                  : 'border-transparent cursor-not-allowed text-zinc-400'
                  }`}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-zinc-900/50 border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none transition-all ${isEditing
                  ? 'border-zinc-700 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
                  : 'border-transparent cursor-not-allowed text-zinc-400'
                  }`}
              />
            </div>
          </div>

          {/* PIN (Only in Edit Mode) */}
          {isEditing && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-xs font-bold text-brand-primary uppercase tracking-widest ml-1">New PIN (Optional)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
                <input
                  type="password"
                  placeholder="Enter 4-digit PIN to update"
                  maxLength={4}
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  className="w-full bg-zinc-900/50 border border-brand-primary/30 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* EDIT ACTIONS */}
        {isEditing && (
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={cancelEdit}
              className="py-3 rounded-xl font-bold border border-zinc-700 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="py-3 rounded-xl font-bold bg-brand-primary hover:bg-brand-secondary text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
            >
              {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>

      <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider pl-2 mt-8">Account</h3>

      <button onClick={handleLogout} className="w-full glass-card p-4 rounded-2xl flex items-center justify-between group hover:bg-red-500/5 transition-colors border border-red-500/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <LogOut size={20} />
          </div>
          <div className="text-left">
            <p className="font-bold text-red-500">Log Out</p>
            <p className="text-sm text-red-400/70">Sign out of your account</p>
          </div>
        </div>
        <ChevronRight className="text-red-500/50" />
      </button>

      <div className="text-center pt-8">
        <p className="text-xs text-[var(--text-secondary)]">FinAgent v1.3.0 • Build 2025.12</p>
      </div>

    </div>
  )
}

export default Settings
