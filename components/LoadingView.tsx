'use client'

import { useState, useEffect } from 'react'

export default function LoadingView() {
  const [dots, setDots] = useState('')
  const phrases = [
    '여행지의 기후와 날씨를 분석하고 있어요 ☁️',
    '놓치기 쉬운 필수 행정 서류를 점검하는 중 🛂',
    '테마에 꼭 맞는 짐들을 트렁크에 챙기는 중 🧳',
    '현지에서 유용한 앱과 꿀팁을 검색 중 📱',
    '거의 다 완성되었어요! ✨'
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
    <div className="w-full max-w-lg mx-auto transform transition-all">
      <div className="bg-white/[0.12] backdrop-blur-md border border-white/25 rounded-2xl p-12 flex flex-col items-center justify-center shadow-xl min-h-[450px]">
        
        {/* Animated Icon */}
        <div className="relative mb-10 w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="text-5xl animate-pulse">✈️</div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">가이드를 준비 중입니다</h2>
        
        <div className="h-6 flex items-center justify-center w-full">
          <p className="text-white/90 text-sm font-medium transition-opacity animate-pulse">
            {phrases[phraseIdx]}{dots}
          </p>
        </div>
      </div>
    </div>
  )
}
