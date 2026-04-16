'use client'

import { useState, useRef, useEffect } from 'react'
import { TripInput, ChatMessage, ChecklistItem } from '@/types'

interface Props {
  input: TripInput
  onAddItem: (item: Omit<ChecklistItem, 'id' | 'checked'>) => void
}

export default function ChatWidget({ input, onAddItem }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!userInput.trim()) return
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }]
    setMessages(newMessages)
    setUserInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, messages: newMessages }),
      })
      const data = await res.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }])

      if (data.suggestedItem) {
        onAddItem({
          category: data.suggestedItem.category || '🤖 AI 추천',
          type: data.suggestedItem.type || 'recommended',
          item: data.suggestedItem.item,
          reason: 'AI 채팅 추가 아이템',
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px] md:h-[450px]">
      <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
        <h2 className="font-bold text-gray-800 text-sm flex items-center">
          <span className="mr-2">💬</span> AI 어시스턴트에게 더 물어보기
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">상세 일정, 맛집 추천 구체적인 팁을 질문하세요.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-400 mt-4">
            '가족 회식 장소로 좋은 식당을 추천해줘', '등산용품은 어떤게 필요할까?' 같이 질문해보세요.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`inline-block px-4 py-2.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {m.content.split('\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <span className="inline-block px-4 py-2.5 rounded-2xl bg-white border border-gray-100 text-gray-400 text-sm rounded-bl-none">
              AI가 생각중입니다...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 relative">
          <input
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="AI에게 질문 해보세요..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-5 pr-14 py-3 md:py-2.5 text-sm md:text-base focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !userInput.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 text-white w-10 md:w-9 h-10 md:h-9 rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400 hover:bg-indigo-700 transition-colors"
            title="전송"
          >
            ↑
          </button>
        </div>
      </div>
    </section>
  )
}
