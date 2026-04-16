'use client'

import { useState } from 'react'
import { TripResult } from '@/types'
import Checklist from './Checklist'
import AdminTips from './AdminTips'
import PdfExport from './PdfExport'
import ShareButton from './ShareButton'
import ChatWidget from './ChatWidget'

interface Props {
  initialResult: TripResult
}

export default function ResultView({ initialResult }: Props) {
  const [result, setResult] = useState<TripResult>(initialResult)

  function handleToggleChecklist(id: string) {
    setResult(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }))
  }

  const { itinerary } = result.input

  return (
    <div className="max-w-4xl mx-auto my-4 md:my-8 pb-24 md:pb-8">
      <div id="result-content" className="space-y-8 bg-white p-4 md:p-10 rounded-2xl shadow-sm border border-gray-100 mb-6 relative">
        <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="text-xs text-indigo-600 font-semibold uppercase tracking-widest mb-2">✈️ AI 맞춤 여행 가이드</div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {itinerary.map(l => `${l.country} · ${l.city}`).join(', ')} 여행 가이드
            </h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {itinerary.map((leg, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                  🗾 {leg.country} · {leg.city} &nbsp;{leg.startDate} ~ {leg.endDate}
                </span>
              ))}
              <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                👤 {result.input.travelers}명
              </span>
              {result.input.theme && (
                <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                  🎯 {result.input.theme}
                </span>
              )}
            </div>
          </div>
          <div className="hidden md:flex gap-2 print:hidden">
            <PdfExport result={result} />
            <ShareButton />
          </div>
        </header>

        <section className="print:break-inside-avoid">
          <h2 className="text-lg font-bold text-[#1e1b4b] mb-4">여행 전 필수 팁</h2>
          <AdminTips tips={result.admin_tips} />
        </section>

        <section className="print:break-inside-avoid">
          <h2 className="text-lg font-bold text-[#1e1b4b] mb-4">맞춤형 짐 체크리스트</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <Checklist items={result.checklist} onToggle={handleToggleChecklist} />
          </div>
        </section>

        <section className="print:hidden">
          <ChatWidget 
            input={result.input}
            onAddItem={(item) => {
              setResult(prev => {
                const newItem = { ...item, id: `chat-${Date.now()}`, checked: false }
                return { ...prev, checklist: [...prev.checklist, newItem] }
              })
            }}
          />
        </section>
      </div>

      {/* 모바일 스티키 하단 액션 바 */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-xl border-t border-gray-200 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 md:hidden print:hidden">
        <PdfExport result={result} />
        <ShareButton />
      </div>
    </div>
  )
}
