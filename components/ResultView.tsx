'use client'

import { useState } from 'react'
import { TripResult } from '@/types'
import Checklist from './Checklist'
import AdminTips from './AdminTips'
import PdfExport from './PdfExport'
import ShareButton from './ShareButton'
import ManualAddItem from './ManualAddItem'

interface Props {
  initialResult: TripResult
}

export default function ResultView({ initialResult }: Props) {
  const [result, setResult] = useState<TripResult>(initialResult)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

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
        <header className="ticket-cutout p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between items-start gap-6 border-b-2 border-dashed border-gray-300 pb-8 mb-4">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between w-full mb-3">
              <div className="text-sm text-sky-600 font-bold uppercase tracking-widest flex items-center gap-2 font-title">
                <span>✈️ BOARDING PASS</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">THE LAZY PACKER</span>
              </div>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors print:hidden text-xs font-bold"
              >
                🏠 홈으로
              </button>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-title mb-4 break-keep">
              {itinerary.map(l => `${l.country} · ${l.city}`).join(', ')}
            </h1>
            
            <div className="flex flex-col gap-3 bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 w-full overflow-hidden">
              <div className="flex flex-wrap items-stretch gap-3">
                {itinerary.map((leg, i) => (
                  <div key={i} className="flex flex-col bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-1 min-w-[220px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-1.5 tracking-wider">
                      {itinerary.length > 1 ? `FLIGHT ${i + 1}` : 'DESTINATION'}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-sm md:text-base font-bold text-slate-800 whitespace-nowrap">
                        {leg.country} {leg.city}
                      </span>
                      <span className="text-xs font-bold text-sky-700 bg-sky-100/70 px-2 py-1 rounded-md text-center whitespace-nowrap">
                        {leg.startDate.replace(/-/g, '.')} ~ {leg.endDate.replace(/-/g, '.')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {result.input.theme && (
                <div className="flex items-center gap-2 mt-1 ml-1 px-2 border-l-2 border-slate-300">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CLASS</span>
                  <span className="text-sm font-bold text-slate-800">{result.input.theme}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-center gap-4 border-t md:border-t-0 md:border-l border-dashed border-gray-300 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            {/* Fake Barcode */}
            <div className="flex items-end gap-[2px] h-12 opacity-40">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="bg-slate-800" style={{ width: `${Math.random() * 4 + 1}px`, height: `${Math.random() * 40 + 40}%` }}></div>
              ))}
            </div>
            <div className="flex gap-2 print:hidden w-full md:w-auto mt-2">
              <PdfExport result={result} />
              <ShareButton />
            </div>
          </div>
        </header>

        <section className="print:break-inside-avoid">
          <h2 className="text-lg font-bold text-[#1e1b4b] mb-4">여행 전 필수 팁</h2>
          <AdminTips tips={result.admin_tips} />
        </section>

        <section className="print:break-inside-avoid">
          <h2 className="text-lg font-bold text-[#1e1b4b] mb-4">맞춤형 짐 체크리스트</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <Checklist 
              items={result.checklist} 
              onToggle={handleToggleChecklist} 
              highlightedId={highlightedId}
            />
          </div>
        </section>

        <section className="print:hidden">
          <h2 className="text-lg font-bold text-[#1e1b4b] mb-4">나만의 짐 추가하기</h2>
          <div className="bg-[#f8f9fe] border border-indigo-100 rounded-xl p-5">
            <ManualAddItem 
              theme={result.input.theme}
              onAddItem={(item) => {
                const newId = `manual-${Date.now()}`
                const newItem = { ...item, id: newId, checked: false }
                
                setResult(prev => ({ ...prev, checklist: [...prev.checklist, newItem] }))
                setHighlightedId(newId)
                
                // DOM update 후 스크롤 이동
                setTimeout(() => {
                  document.getElementById(`checklist-item-${newId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 100)
                
                // 3초 후 하이라이트 해제
                setTimeout(() => setHighlightedId(null), 3000)
              }}
            />
          </div>
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
