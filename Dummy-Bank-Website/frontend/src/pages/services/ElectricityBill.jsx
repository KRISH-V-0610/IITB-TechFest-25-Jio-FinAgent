import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Loader2, ChevronDown } from 'lucide-react'
import useBankStore from '../../store/bankStore'

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi"
];

const ElectricityBill = () => {
  const navigate = useNavigate()
  const { user } = useBankStore()
  const [state, setState] = useState('')
  const [board, setBoard] = useState('')
  const [consumerNumber, setConsumerNumber] = useState('')
  const [billDetails, setBillDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-fill from user details on mount
  useEffect(() => {
    if (user?.electricityDetails) {
      const { state: savedState, board: savedBoard, consumerNumber: savedConsumer } = user.electricityDetails;
      if (savedState) setState(savedState);
      if (savedBoard) setBoard(savedBoard);
      if (savedConsumer) setConsumerNumber(savedConsumer);

      // OPTIONAL: If all details are present, could auto-fetch bill
      // if(savedState && savedBoard && savedConsumer) handleFetchBill();
    }
  }, [user])

  const handleFetchBill = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setBillDetails({
        name: user?.name || 'Customer',
        amount: 1450.00,
        dueDate: '25 Dec 2024',
        billDate: '01 Dec 2024'
      })
      setIsLoading(false)
    }, 1500)
  }

  const handlePay = () => {
    const recipient = {
      id: 'electricity',
      name: `${board} Bill`,
      upiId: 'electricity@bills',
      upi: 'electricity@bills'
    }

    // Persist details
    const persistDetails = {
      consumerNumber,
      board,
      state
    }

    navigate('/confirmation', {
      state: {
        recipient: recipient,
        amount: billDetails.amount,
        fee: 2.00, // Convenience Fee
        note: `Electricity Bill: ${consumerNumber}`,
        category: 'BILL',
        billDetails: persistDetails
      }
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5 mb-4">
        <ArrowRight className="rotate-180" size={18} /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
          <Zap size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Electricity Bill</h1>
          <p className="text-zinc-500 text-sm">Pay your electricity consumption charges</p>
        </div>
      </div>

      {!billDetails ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">State</label>
            <div className="relative">
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none pr-10"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Board</label>
            <div className="relative">
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none pr-10"
              >
                <option value="">Select Board</option>
                <option value="Adani Electricity">Adani Electricity</option>
                <option value="Tata Power">Tata Power</option>
                <option value="MSEDCL">MSEDCL</option>
                <option value="BSES Rajdhani">BSES Rajdhani</option>
                <option value="BESCOM">BESCOM</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Consumer Number</label>
            <input
              type="text"
              value={consumerNumber}
              onChange={(e) => setConsumerNumber(e.target.value)}
              placeholder="e.g. 100000213123"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
            />
          </div>

          <button
            onClick={handleFetchBill}
            disabled={!state || !board || !consumerNumber || isLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-900/20 mt-6 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Fetch Bill'}
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Bill Amount</p>
            <p className="text-4xl font-bold text-white mt-2">₹{billDetails.amount}</p>
            <p className="text-zinc-400 text-sm mt-1">Due Date: {billDetails.dueDate}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Customer Name</span>
              <span className="text-white font-medium">{billDetails.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Bill Date</span>
              <span className="text-zinc-400">{billDetails.billDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Consumer No</span>
              <span className="text-zinc-400 font-mono">{consumerNumber}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            Pay Bill
          </button>

          <button
            onClick={() => setBillDetails(null)}
            className="w-full text-zinc-500 text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default ElectricityBill
