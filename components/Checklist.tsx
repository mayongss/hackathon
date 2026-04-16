'use client'

import { useState } from 'react'
import { ChecklistItem as Item } from '@/types'
import ChecklistItemComponent from './ChecklistItem'

interface Props {
  items: Item[]
  onToggle: (id: string) => void
}

export default function Checklist({ items, onToggle }: Props) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const category = item.category || '기타'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, Item[]>)

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  return (
    <div className="space-y-6">
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
                <ChecklistItemComponent key={item.id} item={item} onToggle={onToggle} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
