'use client'

import { useState, useRef, useEffect } from 'react'
import { POPULAR_COUNTRIES, matchSearch } from '@/lib/countries'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export default function CountryAutocomplete({ value, onChange, placeholder, className, required }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 부모로부터 value가 바뀌면 내부 query도 동기화 (단, 타이핑 중이 아닐 때만 유용하지만 단순화를 위해 동기화)
  useEffect(() => {
    setQuery(value)
  }, [value])

  const filtered = POPULAR_COUNTRIES.filter(country => matchSearch(country, query))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // 외부 클릭시 입력중이던 값을 부모에게 그대로 전달 (자유 입력 허용)
        onChange(query)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [query, onChange])

  const handleSelect = (country: string) => {
    setQuery(country)
    onChange(country)
    setIsOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onChange(e.target.value) // 즉시 반영
    setIsOpen(true)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            <ul className="py-1">
              {filtered.map(country => (
                <li
                  key={country}
                  onClick={() => handleSelect(country)}
                  className="px-4 py-2.5 text-sm text-gray-800 hover:bg-[#6c47ff]/10 hover:text-[#6c47ff] cursor-pointer transition-colors"
                >
                  {country}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              추천 목록에 없습니다. (자유 입력 가능)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
