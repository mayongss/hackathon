'use client'

import { useState } from 'react'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleCopy() {
    setIsLoading(true)
    try {
      // Create shortlink
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(window.location.href)}`)
      let linkToCopy = window.location.href
      if (res.ok) {
        linkToCopy = await res.text()
      }
      
      await navigator.clipboard.writeText(linkToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
      await navigator.clipboard.writeText(window.location.href)
    } finally {
      setIsLoading(false)
    }
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
