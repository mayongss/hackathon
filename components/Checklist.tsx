'use client'

import { useState, useEffect } from 'react'
import { ChecklistItem as Item } from '@/types'
import ChecklistItemComponent from './ChecklistItem'

interface Props {
  items: Item[]
  onToggle: (id: string) => void
  highlightedId?: string | null
}

type FilterType = 'all' | 'unchecked' | 'checked'

export default function Checklist({ items, onToggle, highlightedId }: Props) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    if (highlightedId) {
      const target = items.find(i => i.id === highlightedId)
      if (target && target.category) {
        setCollapsedCategories(prev => {
          if (prev[target.category!]) {
            return { ...prev, [target.category!]: false }
          }
          return prev
        })
      }
    }
  }, [highlightedId, items])

  // Group items by category (with Filter applied)
  const grouped = items.reduce((acc, item) => {
    if (filter === 'unchecked' && item.checked) return acc
    if (filter === 'checked' && !item.checked) return acc

    const category = item.category || '기타'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, Item[]>)

  // Sort items within each category: unchecked first, checked at the bottom
  Object.values(grouped).forEach(catItems => {
    catItems.sort((a, b) => {
      if (a.checked === b.checked) return 0
      return a.checked ? 1 : -1
    })
  })

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4 print:hidden">
        <div className="bg-slate-200/60 p-1 rounded-xl flex text-sm font-bold shadow-inner">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            전체 보기
          </button>
          <button 
            onClick={() => setFilter('unchecked')} 
            className={`px-4 py-1.5 rounded-lg transition-all ${filter === 'unchecked' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            챙길 짐
          </button>
          <button 
            onClick={() => setFilter('checked')} 
            className={`px-4 py-1.5 rounded-lg transition-all ${filter === 'checked' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            다 싼 짐
          </button>
        </div>
      </div>
      {Object.entries(grouped).map(([category, catItems]) => {
        const isCollapsed = collapsedCategories[category] || false

        return (
          <section key={category}>
            <div 
              onClick={() => toggleCategory(category)}
              className="flex items-center justify-between cursor-pointer group mb-3 rounded-lg hover:bg-gray-50 -ml-2 px-2 py-1 transition-colors"
            >
              <h3 className="flex items-center gap-2 text-[15px] font-bold text-gray-800 bg-gray-200/60 rounded-lg px-3 py-1.5 w-fit">
                🏷️ {category} <span className="text-xs font-normal text-gray-600 opacity-80">{catItems.length}</span>
              </h3>
              <div className="text-gray-400 group-hover:text-gray-600 p-1 print:hidden">
                <svg className={`w-5 h-5 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {/* Always show in print mode even if collapsed locally */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${isCollapsed ? 'hidden print:grid' : 'print:grid'}`}>
              {catItems.map(item => (
                <ChecklistItemComponent 
                  key={item.id} 
                  item={item} 
                  onToggle={onToggle}
                  highlight={item.id === highlightedId}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
