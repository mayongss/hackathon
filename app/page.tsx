'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TripForm from '@/components/TripForm'
import LoadingView from '@/components/LoadingView'
import { TripInput, TripResult } from '@/types'
import { encodeResult } from '@/lib/share'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(input: TripInput) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let errorMsg = 'AI 생성 중 오류가 발생했습니다.';
        try {
          const data = JSON.parse(text);
          errorMsg = data.details ? `${data.error} (${data.details})` : (data.error || errorMsg);
        } catch {
          errorMsg = `서버 응답 오류 (JSON 파싱 실패): ${res.status} ${text.substring(0, 100)}`;
        }
        setError(errorMsg)
        setIsLoading(false)
        return
      }

      const result: TripResult = await res.json()
      const dataStr = encodeResult(result)
      router.push(`/result?data=${dataStr}`)
    } catch (err) {
      console.error(err)
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-200 to-pink-200 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      
      {/* CSS Animated Clouds */}
      <div className="absolute top-[10%] left-[-20%] w-32 h-10 bg-white/70 rounded-full blur-sm cloud-1 z-0"></div>
      <div className="absolute top-[30%] right-[-20%] w-48 h-16 bg-white/60 rounded-full blur-md cloud-2 z-0 scale-125"></div>
      <div className="absolute top-[70%] left-[20%] w-64 h-20 bg-white/50 rounded-full blur-lg cloud-3 z-0 scale-150"></div>
      
      {/* Animated Airplane */}
      <div className="plane-landing text-5xl opacity-80 drop-shadow-lg">✈️</div>

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100/90 backdrop-blur-sm border border-red-300 text-red-700 text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700/70 hover:text-red-700 font-bold">✕</button>
        </div>
      )}
      
      <div className="w-full max-w-5xl relative z-10 transition-all duration-500 ease-in-out">
        {isLoading ? (
          <LoadingView />
        ) : (
          <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </div>
    </main>
  )
}
