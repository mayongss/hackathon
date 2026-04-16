'use client'

import { useState } from 'react'
import { TripInput, TripItinerary } from '@/types'

interface Props {
  onSubmit: (input: TripInput) => void
  isLoading: boolean
}

export default function TripForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<TripInput>({
    itinerary: [{ country: '', city: '', startDate: '', endDate: '' }],
    travelers: 1,
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

  const inputClass = "w-full bg-white/15 border border-white/20 rounded-xl px-3 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-colors"
  const labelClass = "block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1"

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">✈️</div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">TravelAI</h1>
        <p className="text-white/70 mt-2 text-sm">AI가 만드는 나만의 여행 가이드</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/[0.12] backdrop-blur-md border border-white/25 rounded-2xl p-4 md:p-6 flex flex-col gap-5 shadow-xl"
      >
        {/* 여정 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white/90">방문 여정</h2>
            <button
              type="button"
              onClick={addItinerary}
              className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full hover:bg-white/20 transition-colors"
            >
              + 여정 추가
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {form.itinerary.map((leg, index) => (
              <div key={index} className="bg-white/[0.08] rounded-xl p-4 relative">
                {form.itinerary.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItinerary(index)}
                    className="absolute top-2 right-2 text-white/40 hover:text-white/80 text-lg leading-none"
                  >
                    ×
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>국가</label>
                    <input
                      name="country"
                      value={leg.country}
                      onChange={(e) => handleItineraryChange(index, e)}
                      placeholder="예: 일본"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>도시</label>
                    <input
                      name="city"
                      value={leg.city}
                      onChange={(e) => handleItineraryChange(index, e)}
                      placeholder="예: 도쿄"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        {/* 인원 */}
        <div>
          <label className={labelClass}>여행 인원</label>
          <input
            name="travelers"
            type="number"
            min={1}
            max={20}
            value={form.travelers}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* 테마 */}
        <div>
          <label className={labelClass}>여행 테마 / 키워드</label>
          <textarea
            name="theme"
            value={form.theme}
            onChange={handleChange}
            placeholder="예: 아이와 함께, 골프, 미술관, 맛집 탐방..."
            rows={3}
            className={inputClass}
          />
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full bg-white text-[#6c47ff] font-bold rounded-xl px-6 py-3 hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg text-sm"
        >
          {isLoading ? 'AI가 가이드를 생성하고 있어요...' : '✨ 나만의 맞춤 가이드 만들기'}
        </button>
      </form>
    </div>
  )
}
