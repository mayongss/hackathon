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
    <main className="min-h-screen bg-gradient-to-br from-[#6c47ff] via-[#4d28d4] to-[#2a0e8a] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-96 bg-white/5 backdrop-blur-3xl rounded-b-[100%] scale-150 transform -translate-y-1/2 -z-10" />

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-white/70 hover:text-white font-bold">✕</button>
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
