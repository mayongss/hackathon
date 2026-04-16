'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TripForm from '@/components/TripForm'
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
        const data = await res.json().catch(() => ({}))
        const errorMsg = data.details ? `${data.error} (${data.details})` : (data.error || 'AI 생성 중 오류가 발생했습니다.')
        setError(errorMsg)
        return
      }

      const result: TripResult = await res.json()
      const dataStr = encodeResult(result)
      router.push(`/result?data=${dataStr}`)
    } catch (err) {
      console.error(err)
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex flex-col items-center justify-center py-6 md:py-12 px-4 md:px-0">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-white/70 hover:text-white font-bold">✕</button>
        </div>
      )}
      <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
    </main>
  )
}
