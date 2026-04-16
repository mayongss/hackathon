'use client'

import { useState } from 'react'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleCopy() {
    setIsLoading(true)
    let linkToCopy = window.location.href
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: window.location.href })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.shortUrl) linkToCopy = data.shortUrl
      }
    } catch (err) {
      console.error('Shorten fail:', err)
    }

    // Always copy something and show success
    await navigator.clipboard.writeText(linkToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setIsLoading(false)
  }

  return (
    <button
      onClick={handleCopy}
      disabled={isLoading}
      className={`flex-1 border bg-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-sm whitespace-nowrap disabled:opacity-50 ${
        copied ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {isLoading ? '링크 줄이는 중...' : copied ? '✅ 복사 완료!' : '🔗 숏링크 공유'}
    </button>
  )
}
