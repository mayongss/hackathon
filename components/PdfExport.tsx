'use client'

import { useState } from 'react'
import { TripResult } from '@/types'
import { exportToPdf } from '@/lib/pdf'

interface Props {
  result: TripResult
}

export default function PdfExport({ result }: Props) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const destination = result.input.itinerary[0]?.city || '여행'
      const filename = `${destination}-체크리스트.pdf`
      await exportToPdf('result-content', filename)
    } catch (err) {
      console.error(err)
      alert('PDF 저장 중 오류가 발생했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
    >
      {isExporting ? '저장 중...' : 'PDF 다운로드 (A4)'}
    </button>
  )
}
