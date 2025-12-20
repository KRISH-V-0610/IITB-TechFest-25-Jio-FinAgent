import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Wallet, TrendingUp, ShieldCheck } from 'lucide-react'
import useBankStore from '../../store/bankStore'

// Mock gold price
// Mock gold price
const BUY_PRICE = 13600.00
const SELL_PRICE = 13150.00 // Spread gap
const GST_RATE = 0.03

const BuyGold = () => {
  const navigate = useNavigate()
  const { user } = useBankStore()
  const [amount, setAmount] = useState('')
  const [goldVal, setGoldVal] = useState(0)
  const [gstVal, setGstVal] = useState(0)
  const [grams, setGrams] = useState(0)

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const totalInput = parseFloat(amount)

      // Real logic: Amount = GoldValue + GST
      // GoldValue = Amount / (1 + GST)
      const valueWithoutTax = totalInput / (1 + GST_RATE)
      const tax = totalInput - valueWithoutTax

      const purchaseGrams = valueWithoutTax / BUY_PRICE

      setGoldVal(valueWithoutTax)
      setGstVal(tax)
      setGrams(purchaseGrams.toFixed(4))
    } else {
      setGrams(0)
      setGoldVal(0)
      setGstVal(0)
    }
  }, [amount])

  const handleBuy = () => {
    const recipient = {
      id: 'gold_vault',
      name: 'Digital Gold Vault',
      upiId: 'gold@dummybank',
      upi: 'gold@dummybank'
    }

    navigate('/confirmation', {
      state: {
        recipient: recipient,
        // In this model, user pays 'amount', which includes tax.
        // But our confirmation adds tax to amount.
        // Let's adjust: We will pass the 'Gold Value' as Amount, and Tax separately.
        amount: goldVal.toFixed(2),
        tax: gstVal.toFixed(2),
        isGold: true,
        note: `Buy ${grams}gm Gold @ ₹${BUY_PRICE}/gm`,
        category: 'GOLD'
      }
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5 mb-4">
        <ArrowRight className="rotate-180" size={18} /> Back
      </button>

      {/* HEADER CARD */}
      <div className="bg-gradient-to-br from-yellow-700/20 to-yellow-900/20 border border-yellow-700/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <TrendingUp size={100} className="text-yellow-500" />
        </div>
        <div className="relative z-10">
          <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldCheck size={14} /> 24K | 99.9% Pure
          </p>
          <h1 className="text-3xl font-bold text-white mb-1">Digital Gold</h1>
          <p className="text-zinc-400 text-sm">Safe, Secure & Insured</p>
        </div>
      </div>

      {/* PRICE TICKER with SPREAD */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Buy Price</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-white font-mono font-bold">₹{BUY_PRICE}</span>
          </div>
          <span className="text-[10px] text-zinc-600 mt-1">per gram (includes duty)</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center opacity-75">
          <span className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Sell Price</span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-300 font-mono font-bold">₹{SELL_PRICE}</span>
          </div>
          <span className="text-[10px] text-zinc-600 mt-1">per gram</span>
        </div>
      </div>

      {/* INPUT */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-center text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
            Amount (Total Payable)
          </label>
          <div className="relative max-w-[200px] mx-auto">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-5xl font-bold text-white text-center focus:outline-none placeholder:text-zinc-800 no-spinners"
            />
          </div>

          {/* BREAKDOWN MINI */}
          {parseFloat(amount) > 0 && (
            <div className="mt-4 bg-black/20 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Gold Value</span>
                <span className="text-zinc-300">₹{goldVal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">GST (3%)</span>
                <span className="text-zinc-300">₹{gstVal.toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-700/50 mt-1 pt-1 flex justify-between font-bold text-yellow-500">
                <span>You Get</span>
                <span>{grams} gm</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleBuy}
          disabled={!amount || amount <= 0}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-900/20"
        >
          Buy Gold
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        <div className="min-w-[140px] bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
          <p className="text-zinc-500 text-xs mb-1">Your Gold Balance</p>
          <p className="text-white font-bold">{user?.goldBalance || '0.0000'} gm</p>
        </div>
        <div className="min-w-[140px] bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
          <p className="text-zinc-500 text-xs mb-1">Current Value</p>
          <p className="text-white font-bold">₹{((user?.goldBalance || 0) * SELL_PRICE).toFixed(2)}</p>
        </div>
      </div>

    </div>
  )
}

export default BuyGold
