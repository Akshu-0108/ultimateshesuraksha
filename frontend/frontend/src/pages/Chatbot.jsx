import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User } from 'lucide-react'
import faceIcon from '../assets/face-icon.png'
import { api } from '../services/api'
import AmbientDots from '../components/AmbientDots'

const SUGGESTED_PROMPTS = [
  'How do I trigger the SOS alert?',
  'Is my current area safe right now?',
  'How does Connect Here work?',
]

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am your SheSuraksha AI Safety Companion.',
    },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    try {
      const { reply } = await api('/chatbot/message', { method: 'POST', body: JSON.stringify({ message: text }) })
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch (requestError) {
      setMessages((prev) => [...prev, { role: 'assistant', text: requestError.message }])
    }
    setInput('')
  }

  return (
    <div className="soft-cream-page min-h-screen px-4 py-10 flex justify-center motion-page"><AmbientDots />
      <div className="max-w-xl w-full bg-gradient-to-br from-burgundy-dark to-[#3a0d10] rounded-3xl shadow-2xl flex flex-col h-[calc(100vh-5rem)] min-h-[600px] overflow-hidden motion-panel">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gold/10">
          <img src={faceIcon} alt="SheSuraksha" className="w-8 h-auto" />
          <div>
            <div className="text-cream font-semibold text-sm">SheSuraksha AI Companion</div>
            <div className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Active telemetry
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 motion-chat-message ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-gold/20' : 'bg-cream/10'
                }`}
              >
                {msg.role === 'user' ? (
                  <User size={14} className="text-gold" />
                ) : (
                  <Sparkles size={14} className="text-gold" />
                )}
              </div>
              <div
                className={`max-w-[75%] text-sm px-4 py-2.5 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gold text-burgundy-dark rounded-br-sm'
                    : 'bg-black/25 text-cream rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-black/20 text-cream/80 border border-gold/20 px-3 py-1.5 rounded-full hover:border-gold/50 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex items-center gap-2 px-4 py-3 border-t border-gold/10"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about safety, routes, or SOS..."
            className="flex-1 bg-black/20 text-cream text-sm rounded-full px-4 py-2.5 outline-none placeholder:text-cream/30"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-gold flex items-center justify-center hover:bg-gold-light transition"
          >
            <Send size={16} className="text-burgundy-dark" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chatbot
