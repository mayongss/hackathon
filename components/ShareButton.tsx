'use client'

import { useState } from 'react'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex-1 border bg-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-sm whitespace-nowrap ${
        copied ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {copied ? '✅ 복사 완료!' : '🔗 결과 링크 공유'}
    </button>
  )
}
