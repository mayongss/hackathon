'use client'

import { useState } from 'react'
import { TripInput, TripItinerary } from '@/types'

interface Props {
  onSubmit: (input: TripInput) => void
  isLoading: boolean
}

import CountryAutocomplete from './CountryAutocomplete'
import CityAutocomplete from './CityAutocomplete'

export default function TripForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<TripInput>({
    itinerary: [{ country: '', city: '', startDate: '', endDate: '' }],
    theme: '',
  })

  function handleItineraryChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    const updated = [...form.itinerary]
    updated[index] = { ...updated[index], [name]: value }
    setForm(prev => ({ ...prev, itinerary: updated }))
  }

  function addItinerary() {
    setForm(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { country: '', city: '', startDate: '', endDate: '' }]
    }))
  }

  function removeItinerary(index: number) {
    if (form.itinerary.length === 1) return
    const updated = form.itinerary.filter((_, i) => i !== index)
    setForm(prev => ({ ...prev, itinerary: updated }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'travelers' ? Number(value) : value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  const inputClass = "w-full bg-white/40 border border-white/50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-sky-400 focus:bg-white/60 transition-colors shadow-sm"
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5"

  return (
    <div className="w-full max-w-lg mx-auto mt-4 md:mt-10">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight drop-shadow-sm font-title mt-4">
          게으른 여행자
        </h1>
        <p className="text-slate-800 mt-3 text-base font-medium drop-shadow-sm">
          설레는 여행, 눈 앞이 캄캄한 짐싸기는 제게 맡기세요. <br/>
          당신은 창밖 풍경만 감상하면 됩니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6"
      >
        {/* 여정 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">어디로, 언제 떠나시나요?</h2>
            <button
              type="button"
              onClick={addItinerary}
              className="text-xs px-3 py-1.5 bg-sky-100 text-sky-700 font-bold rounded-full hover:bg-sky-200 transition-colors shadow-sm"
            >
              + 여정 추가
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {form.itinerary.map((leg, index) => (
              <div key={index} className="bg-white/30 rounded-2xl p-4 border border-white/50 relative shadow-sm">
                {form.itinerary.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItinerary(index)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-lg leading-none"
                  >
                    ×
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>국가</label>
                    <CountryAutocomplete
                      value={leg.country}
                      onChange={(val) => handleItineraryChange(index, { target: { name: 'country', value: val } } as any)}
                      placeholder="예: 일본 (초성검색 가능)"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>도시</label>
                    <CityAutocomplete
                      country={leg.country}
                      value={leg.city}
                      onChange={(val) => handleItineraryChange(index, { target: { name: 'city', value: val } } as any)}
                      placeholder={leg.country ? "예: 도쿄 (자유 입력 가능)" : "국가를 먼저 선택해주세요"}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>출발일</label>
                    <input
                      type="date"
                      name="startDate"
                      value={leg.startDate}
                      onChange={(e) => handleItineraryChange(index, e)}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>도착일</label>
                    <input
                      type="date"
                      name="endDate"
                      value={leg.endDate}
                      onChange={(e) => handleItineraryChange(index, e)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 테마 */}
        <div>
          <label className={labelClass}>어떤 여행인가요? (테마)</label>
          <textarea
            name="theme"
            value={form.theme}
            onChange={handleChange}
            placeholder="예: 아이와 함께하는 호캉스, 맛집 탐방, 스쿠버다이빙..."
            rows={3}
            className={inputClass}
          />
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-lg font-title font-bold rounded-2xl px-6 py-4 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {isLoading ? 'AI가 캐리어를 챙기는 중...' : '내 짐 부탁해! 🧳'}
        </button>
      </form>
    </div>
  )
}
