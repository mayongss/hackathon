'use client'

import { useState } from 'react'

interface Props {
  theme?: string
  onAddItem: (item: { category: string, type: 'essential' | 'recommended', item: string, reason?: string }) => void
}

const BASE_CATEGORIES = ["필수 서류", "의류", "세면도구", "전자기기", "상비약", "기타"]

export default function ManualAddItem({ theme, onAddItem }: Props) {
  const CATEGORIES = theme ? [...BASE_CATEGORIES, theme] : BASE_CATEGORIES
  const [category, setCategory] = useState(CATEGORIES[0])
  const [itemText, setItemText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemText.trim()) return
    onAddItem({
      category,
      type: 'recommended',
      item: itemText.trim(),
      reason: '직접 추가한 항목'
    })
    setItemText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
      <select 
        value={category} 
        onChange={e => setCategory(e.target.value)}
        className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/50"
      >
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      
      <input 
        type="text" 
        value={itemText}
        onChange={e => setItemText(e.target.value)}
        placeholder="추가하실 짐을 입력하세요 (예: 목베개)"
        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/50"
      />
      
      <button 
        type="submit"
        disabled={!itemText.trim()}
        className="bg-[#6c47ff] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#6c47ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap shadow-md focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/50 focus:ring-offset-2 w-full md:w-auto"
      >
        ➕ 추가하기
      </button>
    </form>
  )
}
