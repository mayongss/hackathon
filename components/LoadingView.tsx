'use client'

import { useState, useEffect } from 'react'

export default function LoadingView() {
  const [dots, setDots] = useState('')
  const phrases = [
    '비행기 모드로 전환 중... 🧳',
    'AI가 당신의 캐리어 구석구석을 꽉꽉 채우고 있습니다 ✈️',
    '현지 날씨와 귀차니즘 지수를 스캔 중입니다 🔍',
    '필요 없는 짐은 과감히 빼버리는 중 🗑️',
    '당신은 그저 창밖 풍경만 감상하세요 ☁️'
  ]
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const dotInterval = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 400)
    const phraseInterval = setInterval(() => {
      setPhraseIdx(p => Math.min(p + 1, phrases.length - 1))
    }, 2800) // Change phrase every 2.8s
    
    return () => {
      clearInterval(dotInterval)
      clearInterval(phraseInterval)
    }
  }, [phrases.length])

  return (
    <div className="w-full max-w-lg mx-auto transform transition-all mt-4 md:mt-10">
      <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center min-h-[450px]">
        
        {/* Animated Icon */}
        <div className="relative mb-10 w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-sky-300 border-t-sky-600 rounded-full animate-spin"></div>
          <div className="text-5xl animate-pulse drop-shadow-md">🧳</div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight font-title">AI 캐리어 팩업 가동 중</h2>
        
        <div className="h-10 flex items-center justify-center w-full">
          <p className="text-slate-600 text-sm font-medium transition-opacity animate-pulse text-center leading-relaxed">
            {phrases[phraseIdx]}{dots}
          </p>
        </div>
      </div>
    </div>
  )
}
