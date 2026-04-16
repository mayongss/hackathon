'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ResultView from '@/components/ResultView'
import { decodeResult } from '@/lib/share'
import { TripResult } from '@/types'

function ResultContent() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<TripResult | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      const decoded = decodeResult(data)
      if (decoded) {
        setResult(decoded)
      } else {
        setError(true)
      }
    } else {
      setError(true)
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faff]">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">유효하지 않은 링크입니다</h2>
          <p className="text-gray-500">데이터를 불러올 수 없습니다. 처음부터 다시 시도해주세요.</p>
          <a href="/" className="mt-6 inline-block bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">홈으로 돌아가기</a>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faff] text-gray-500">
        가이드를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faff] py-4 md:py-12 px-2 md:px-0">
      <ResultView initialResult={result} />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f8faff] text-gray-500">불러오는 중...</div>}>
      <ResultContent />
    </Suspense>
  )
}
