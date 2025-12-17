import { useState, useRef, useEffect } from 'react'
import {
  Send, Mic, PanelLeftClose, PanelLeftOpen, SquarePen,
  History, Bot, Wallet, Activity, AlertTriangle, CheckCircle2,
  Terminal
} from 'lucide-react'
import './index.css'

const App = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState('idle')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [history, setHistory] = useState([
    { id: 1, title: 'Pay Electricity Bill' },
    { id: 2, title: 'Invest in Gold' },
    { id: 3, title: 'Update Profile' },
  ])

  const messagesEndRef = useRef(null)
  const logsEndRef = useRef(null)

  // Handle responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) setIsSidebarOpen(false)
      else setIsSidebarOpen(true)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Acknowledgement only - Real backend will drive the rest
    setStatus('running')
    addLog('System started. Waiting for Action Agent to attach...', 'info')
  }

  const handleApprove = () => {
    setStatus('running')
    addLog('User approved action.', 'success')
  }

  const handleReject = () => {
    setStatus('idle')
    addLog('User rejected action.', 'error')
  }

  const addLog = (text, type = 'info') => {
    setLogs(prev => [...prev, { text, type, time: new Date().toLocaleTimeString([], { hour12: false }) }])
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100 overflow-hidden">

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-zinc-200 p-4 z-50 flex items-center justify-between shadow-sm">
        <button onClick={toggleSidebar} className="text-zinc-600 hover:text-zinc-900">
          <PanelLeftOpen className="w-6 h-6" />
        </button>
        <span className="font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-600" />
          FinAgent <span className="text-orange-600">X</span>
        </span>
        <div className="w-6"></div>
      </div>

      {/* LEFT SIDEBAR - HISTORY (Dark Theme) */}
      {/* Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <div
        className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : isMobile ? '-translate-x-full w-64' : 'w-[0px] border-r-0'
          }`}
      >
        <div className="p-3.5 flex flex-col gap-4 overflow-hidden min-w-[16rem]">
          {/* Sidebar Header with Toggle */}
          <div className="flex items-center justify-between text-zinc-400 px-1">
            <button onClick={toggleSidebar} className="hover:text-white transition-colors" title="Close Sidebar">
              <PanelLeftClose className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {/* Optional secondary actions can go here */}
            </div>
          </div>

          <button className="w-full flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 text-sm text-white px-3 py-2.5 rounded-lg transition-all border border-zinc-800 shadow-sm group">
            <span className="flex items-center gap-2 font-medium">
              New Command
            </span>
            <SquarePen className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 no-scrollbar min-w-[16rem]">
          <div className="text-[10px] font-bold text-zinc-600 px-4 py-2 uppercase tracking-wider">Today</div>
          {history.map(item => (
            <button key={item.id} className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 rounded-lg transition-all truncate flex items-center gap-3">
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-900 min-w-[16rem]">
          <div className="flex items-center gap-3 bg-zinc-900/40 p-2 rounded-xl border border-zinc-800/50 hover:bg-zinc-900 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-white shadow-lg text-xs">K</div>
            <div className="text-sm overflow-hidden">
              <div className="font-semibold text-zinc-200 truncate">Krish</div>
              <div className="text-[10px] text-zinc-500 font-medium">Pro Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER - CHAT INTERFACE (Light Theme) */}
      <div className="flex-1 flex flex-col relative w-full pt-16 md:pt-0 bg-white">

        {/* DESKTOP SIDEBAR TOGGLE (Only when Sidebar Closed) */}
        {!isMobile && !isSidebarOpen && (
          <div className="absolute top-3 left-3 z-10 animate-fade-in">
            <button onClick={toggleSidebar} className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors" title="Open Sidebar">
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth no-scrollbar">
          {!messages.length && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in-up">
              <div className="w-16 h-16 bg-white border border-zinc-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Wallet className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-semibold text-zinc-900">How can I help you today?</h1>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>

              {msg.role === 'agent' && (
                <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center shrink-0 mt-1 ring-2 ring-zinc-50">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-2xl text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-zinc-100 text-zinc-900 px-5 py-3 rounded-3xl rounded-tr-md' // Enhanced bubble shape
                : 'pt-1.5'
                }`}>
                {msg.role === 'user' && msg.content}

                {/* Agent Custom Components */}
                {msg.type === 'intent' && (
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 w-full sm:min-w-[320px] shadow-lg shadow-zinc-100/50 mt-2">
                    <div className="flex items-center gap-2 mb-4 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                      <Activity className="w-3 h-3" />
                      Action Planned
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wide">Intent</span>
                        <span className="font-bold text-zinc-900 border-b border-zinc-100 pb-0.5">{msg.data.intent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wide">Amount</span>
                        <span className="font-mono font-bold text-lg text-zinc-900">{msg.data.amount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wide">Recipient</span>
                        <span className="font-bold text-orange-600 flex items-center gap-1.5 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 text-xs">
                          {msg.data.recipient}
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!msg.type && msg.role === 'agent' && (
                  <div className="text-zinc-800 font-medium">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM INPUT SYSTEM */}
        <div className="p-4 bg-white">
          <div className="max-w-3xl mx-auto relative bg-zinc-50 rounded-[26px] border border-zinc-200 focus-within:shadow-md focus-within:border-zinc-300 transition-all duration-300">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Talk to FinAgent..."
              className="w-full bg-transparent text-zinc-900 p-4 pl-5 pr-24 min-h-[52px] max-h-[200px] resize-none outline-none text-sm placeholder:text-zinc-400 no-scrollbar"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-full transition-colors" title="Voice Input">
                <Mic className="w-5 h-5" />
              </button>
              {input.trim() ? (
                <button
                  onClick={handleSend}
                  className="p-2 bg-zinc-900 text-white rounded-full hover:bg-black transition-all shadow-sm"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              ) : (
                <button disabled className="p-2 bg-zinc-200 text-zinc-400 rounded-full cursor-not-allowed">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              )}
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-[10px] text-zinc-400">FinAgent can make mistakes. Please verify sensitive financial overrides.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - LIVE LOGS (Always visible on Desktop) */}
      <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col hidden lg:flex">
        <div className="p-3 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur sticky top-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              System Logs
            </h2>
            <div className="flex gap-2 items-center bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'running' ? 'bg-orange-500 animate-pulse' : 'bg-zinc-600'}`}></span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">{status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-4 bg-black/20 no-scrollbar">
          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-2">
              <Terminal className="w-6 h-6 mb-1 opacity-20" />
              <p>Ready to trace</p>
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 group animate-fade-in text-zinc-300 border-l-2 border-zinc-800 pl-3 py-1 hover:border-zinc-700 transition-colors">
              <span className="text-zinc-600 shrink-0 select-none pt-0.5 text-[10px]">{log.time}</span>
              <span className={`break-words leading-relaxed ${log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warning' ? 'text-amber-400' :
                      log.type === 'pending' ? 'text-zinc-500 italic' : 'text-zinc-400'
                }`}>
                {log.text}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {status === 'waiting' && (
          <div className="p-4 border-t border-zinc-800 bg-amber-950/20 backdrop-blur-sm">
            <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-4 animate-pulse-slow shadow-lg shadow-amber-900/20">
              <div className="flex items-center gap-2 mb-3 text-amber-500">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-sm">Action Paused</span>
              </div>
              <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                The agent has reached a critical checkpoint.
                <span className="block mt-1 text-white">Proceed with payment?</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleReject} className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white py-2.5 rounded-lg text-xs font-medium transition-colors">Abort</button>
                <button onClick={handleApprove} className="bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-orange-900/20">Approve</button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default App
