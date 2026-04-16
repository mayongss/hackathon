'use client'

import { useState, useRef, useEffect } from 'react'
import { matchSearch, CITIES_BY_COUNTRY } from '@/lib/countries'

interface Props {
  country: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export default function CityAutocomplete({ country, value, onChange, placeholder, className, required }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const cityList = CITIES_BY_COUNTRY[country] || []
  const filtered = cityList.filter(city => matchSearch(city, query))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onChange(query)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [query, onChange])

  const handleSelect = (city: string) => {
    setQuery(city)
    onChange(city)
    setIsOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onChange(e.target.value) 
    setIsOpen(true)
  }

  // 국가가 선택되지 않았다면 자동완성 드롭다운 대신 단순 입력만 되도록 렌더링
  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => { if (cityList.length > 0) setIsOpen(true) }}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
        disabled={!country} // 국가가 없으면 입력 비활성화 혹은 단순 텍스트 박스로 사용할 수도 있습니다. (기획에 맞게)
      />
      
      {isOpen && cityList.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            <ul className="py-1">
              {filtered.map(city => (
                <li
                  key={city}
                  onClick={() => handleSelect(city)}
                  className="px-4 py-2.5 text-sm text-gray-800 hover:bg-[#6c47ff]/10 hover:text-[#6c47ff] cursor-pointer transition-colors"
                >
                  {city}
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
