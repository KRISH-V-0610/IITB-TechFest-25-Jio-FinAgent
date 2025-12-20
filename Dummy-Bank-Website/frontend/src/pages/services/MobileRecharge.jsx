import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Check, Loader2, ArrowRight } from 'lucide-react'
import useBankStore from '../../store/bankStore'

const MobileRecharge = () => {
  const navigate = useNavigate()
  const { user } = useBankStore()

  const [mobileNumber, setMobileNumber] = useState('')
  const [operator, setOperator] = useState('')
  const [circle, setCircle] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock Plans Data
  const plans = [
    { id: 1, price: 299, data: '1.5GB/day', val: '28 Days', calls: 'Unlimited' },
    { id: 2, price: 719, data: '2GB/day', val: '84 Days', calls: 'Unlimited' },
    { id: 3, price: 2999, data: '2.5GB/day', val: '365 Days', calls: 'Unlimited' },
    { id: 4, price: 19, data: '1GB', val: '1 Day', calls: 'N/A' },
    { id: 5, price: 479, data: '1.5GB/day', val: '56 Days', calls: 'Unlimited' },
  ]

  // Auto-detect Logic
  const handleNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobileNumber(val)

    if (val.length >= 4) {
      const prefix = val.substring(0, 4)
      // Mock logic based on prefix
      if (['9820', '9920', '9930'].includes(prefix)) {
        setOperator('Jio')
        setCircle('Mumbai')
      } else if (['9810', '9910'].includes(prefix)) {
        setOperator('Airtel')
        setCircle('Delhi')
      } else if (['9840', '9940'].includes(prefix)) {
        setOperator('Vi')
        setCircle('Chennai')
      } else {
        // Default fallbacks for realism feel
        if (!operator) setOperator('Jio')
        if (!circle) setCircle('Maharashtra')
      }
    } else {
      setOperator('')
      setCircle('')
    }
  }

  const handleRecharge = () => {
    const operatorRecipient = {
      id: 'operator',
      name: `${operator} Prepaid`,
      upiId: 'recharge@bills',
      upi: 'recharge@bills'
    }

    navigate('/confirmation', {
      state: {
        recipient: operatorRecipient,
        amount: selectedPlan.price,
        note: `Recharge ${mobileNumber} (${operator})`,
        category: 'BILL'
      }
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-6 relative">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5 mb-4">
        <ArrowRight className="rotate-180" size={18} /> Back
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
          <Smartphone size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mobile Recharge</h1>
          <p className="text-zinc-500 text-sm">Pay bills for any prepaid number</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Number Input */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Mobile Number</label>
          <div className="relative">
            <input
              type="text"
              value={mobileNumber}
              onChange={handleNumberChange}
              placeholder="10-digit number"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
            />
            {operator && circle && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-right">
                <p className="font-bold text-blue-400">{operator}</p>
                <p className="text-zinc-500">{circle}</p>
              </div>
            )}
          </div>
        </div>

        {/* Amount / Plan Selector */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Amount</label>
          <div
            onClick={() => setShowPlanModal(true)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-blue-500 transition-colors"
            role="button"
          >
            {selectedPlan ? (
              <div>
                <span className="text-2xl font-bold text-white">₹{selectedPlan.price}</span>
                <p className="text-xs text-zinc-400">{selectedPlan.data} | {selectedPlan.val}</p>
              </div>
            ) : (
              <span className="text-zinc-500">Pick a Plan</span>
            )}
            <span className="text-blue-500 text-sm font-bold">View Plans</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleRecharge}
          disabled={!selectedPlan || mobileNumber.length !== 10}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 mt-6"
        >
          Recharge Now
        </button>

      </div>

      {/* PLANS MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-zinc-950 w-full max-w-md rounded-t-3xl md:rounded-3xl border border-zinc-800 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/50 rounded-t-3xl">
              <h3 className="font-bold text-white">Select a Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500">
                <ArrowRight className="rotate-45" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowPlanModal(false);
                  }}
                  className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-blue-500 cursor-pointer transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl font-bold text-white">₹{plan.price}</span>
                    {selectedPlan?.id === plan.id && <Check className="text-blue-500" size={18} />}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-zinc-400">
                    <div><span className="block text-zinc-600 mb-0.5">Data</span>{plan.data}</div>
                    <div><span className="block text-zinc-600 mb-0.5">Validity</span>{plan.val}</div>
                    <div><span className="block text-zinc-600 mb-0.5">Calls</span>{plan.calls}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default MobileRecharge
