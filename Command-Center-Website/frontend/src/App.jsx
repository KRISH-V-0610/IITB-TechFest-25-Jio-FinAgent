
import { useState, useEffect, useRef } from 'react'
import { Monitor, Play, Wifi, ShieldAlert, Loader2, Trash2 } from 'lucide-react'
import './index.css'

const App = () => {
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [screenImage, setScreenImage] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const logsEndRef = useRef(null)
  const ws = useRef(null)

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket('ws://localhost:8000/ws')
      ws.current = socket

      socket.onopen = () => {
        setIsConnected(true)
        // Backend sends "Connected" message, so no need to log here locally
      }

      socket.onclose = () => {
        setIsConnected(false)
        setIsRunning(false)
        // Removed the repetitive "Disconnected" log here to reduce noise.
        // The top-right status indicator is enough.
        setTimeout(connect, 3000)
      }

      socket.onmessage = (event) => {
        const data = event.data
        if (data.startsWith('BROADCAST_IMAGE:')) {
          const base64 = data.replace('BROADCAST_IMAGE:', '')
          setScreenImage(`data:image/jpeg;base64,${base64}`)
        }
        else if (data.startsWith('HITL_STATUS:')) {
          const status = data.split(':')[1]
          if (status === 'RUNNING') setIsRunning(true)
          if (status === 'IDLE') setIsRunning(false)
          if (status === 'PAUSED') setIsRunning(true)
        }
        else if (data === 'STREAM:START') {
          // Screen stays ready
        }
        else if (data === 'STREAM:STOP') {
          setScreenImage(null)
        }
        else {
          addLog("AGENT", data)
        }
      }
    }

    connect()

    return () => {
      ws.current?.close()
    }
  }, [])

  const addLog = (source, message) => {
    setLogs(prev => [...prev, { source, message, time: new Date().toLocaleTimeString() }])
  }

  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    if (isRunning) return;

    ws.current.send(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 text-zinc-900 font-sans p-6 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">FinAgent <span className="text-orange-600">Command Center</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-md border border-zinc-200">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-zinc-600">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">

        {/* LEFT: Live Browser Feed using simple flat design */}
        <div className="flex-[7] flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden relative">

          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 backdrop-blur text-zinc-800 px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-2 border border-zinc-200">
              <Wifi className="w-3 h-3 text-emerald-500" />
              LIVE PREVIEW
            </div>
          </div>

          {screenImage ? (
            <div className="relative w-full h-full bg-zinc-100 flex items-center justify-center">
              <img src={screenImage} alt="Live Browser" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-400 gap-3">
              <div className="bg-zinc-100 p-4 rounded-full">
                <Monitor className="w-8 h-8 opacity-30" />
              </div>
              <p className="text-sm font-medium">Waiting for video signal...</p>
            </div>
          )}
        </div>

        {/* RIGHT: Logs */}
        <div className="flex-[3] flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="bg-zinc-50 border-b border-zinc-100 p-3 flex justify-between items-center">
            <h2 className="font-bold text-zinc-700 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-3 h-3 text-orange-500" />
              Logs
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-mono">{logs.length} events</span>
              <button onClick={clearLogs} className="text-zinc-400 hover:text-red-500 transition-colors" title="Clear Logs">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="text-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className={`text-[9px] font-bold px-1 rounded-sm ${log.source === "SYSTEM" ? "bg-zinc-100 text-zinc-500" : "bg-orange-50 text-orange-600"
                    }`}>
                    {log.source}
                  </span>
                  <span className="text-[9px] text-zinc-300 font-mono">{log.time}</span>
                </div>
                <div className="text-zinc-700 leading-snug break-words pl-0.5 text-xs font-medium">
                  {log.message}
                </div>
              </div>
            ))}
            <div ref={logsEndRef}></div>
          </div>
        </div>

      </div>

      {/* Input Area */}
      <div className="mt-4">
        <div className="relative flex items-center gap-2 bg-white p-1.5 rounded-xl border border-zinc-200 focus-within:border-orange-500/50 transition-colors">
          <div className="pl-3">
            {isRunning ? (
              <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRunning ? "Agent is working..." : "Type your command..."}
            disabled={!isConnected || isRunning}
            className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-800 placeholder:text-zinc-400 text-sm font-medium py-2 px-2 disabled:opacity-50 outline-none"
            autoFocus
          />

          <button
            onClick={handleSend}
            disabled={!isConnected || isRunning || !input.trim()}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
          >
            {isRunning ? 'Busy' : 'Run'}
            {!isRunning && <Play className="w-3 h-3 fill-current" />}
          </button>
        </div>
      </div>

    </div>
  )
}

export default App
