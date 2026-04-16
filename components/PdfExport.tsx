'use client'

import { TripResult } from '@/types'

interface Props {
  result: TripResult
}

export default function PdfExport({ result }: Props) {
  function handleExport() {
    // Rely on native browser print for modern CSS support (lab, oklch)
    window.print()
  }

  return (
    <button
      onClick={handleExport}
      className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
    >
      PDF 저장 (인쇄)
    </button>
  )
}
