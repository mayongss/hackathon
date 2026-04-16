# Travel Checklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 목적지/일정/인원/여행 테마를 입력하면 Claude AI가 맞춤형 짐 체크리스트, 날씨 특이점, 비자 정보, 꿀팁을 생성해주는 웹 서비스를 구축한다.

**Architecture:** Next.js App Router로 프론트와 API를 통합하고, Supabase로 Auth와 DB를 처리한다. Claude API로 초기 결과를 JSON으로 생성하며, 결과는 URL 파라미터(base64 인코딩)로 공유한다. 비로그인 사용자는 localStorage, 로그인 사용자는 Supabase에 저장한다.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Claude API (claude-sonnet-4-6), html2canvas + jsPDF, Jest + React Testing Library

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # 랜딩/입력 페이지
│   ├── result/
│   │   └── page.tsx                # AI 결과 페이지
│   └── api/
│       ├── generate/
│       │   └── route.ts            # Claude API 초기 결과 생성
│       └── chat/
│           └── route.ts            # Claude API 채팅 (P2 선택)
├── components/
│   ├── TripForm.tsx                # 입력 폼 (목적지, 일정, 인원, 테마)
│   ├── ResultView.tsx              # 결과 전체 컨테이너
│   ├── WeatherTips.tsx             # 날씨 특이점 섹션
│   ├── VisaInfo.tsx                # 비자 정보 섹션
│   ├── CountryTips.tsx             # 나라 꿀팁 섹션
│   ├── Checklist.tsx               # 짐 체크리스트 (체크/해제)
│   ├── ChecklistItem.tsx           # 개별 체크리스트 항목
│   ├── PdfExport.tsx               # PDF 저장 버튼
│   ├── ShareButton.tsx             # URL 공유 버튼
│   └── ChatWidget.tsx              # AI 채팅창 (P2 선택)
├── lib/
│   ├── claude.ts                   # Claude API 클라이언트
│   ├── prompts.ts                  # 프롬프트 템플릿
│   ├── pdf.ts                      # PDF 생성 로직
│   └── share.ts                    # URL 인코딩/디코딩
├── types/
│   └── index.ts                    # 공통 타입 정의
├── __tests__/
│   ├── lib/
│   │   ├── prompts.test.ts
│   │   └── share.test.ts
│   └── components/
│       ├── TripForm.test.tsx
│       └── Checklist.test.tsx
├── .env.local                      # 환경변수 (gitignore)
└── supabase/
    └── migrations/
        └── 001_initial.sql         # DB 스키마
```

---

## Task 1: 프로젝트 초기 세팅

**Files:**
- Create: `package.json`, `tsconfig.json`, `.env.local`, `tailwind.config.ts`

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-git
```

- [ ] **Step 2: 의존성 설치**

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js @supabase/auth-helpers-nextjs html2canvas jspdf
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 3: Jest 설정**

`jest.config.ts` 생성:

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

`jest.setup.ts` 생성:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: .env.local 생성**

```bash
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 5: 커밋**

```bash
git init
git add .
git commit -m "chore: init Next.js project with Supabase and Claude deps"
```

---

## Task 2: 타입 정의

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: 타입 작성**

`types/index.ts`:

```typescript
export interface TripItinerary {
  country: string
  city: string
  startDate: string   // YYYY-MM-DD
  endDate: string     // YYYY-MM-DD
}

export interface TripInput {
  itinerary: TripItinerary[]
  travelers: number
  theme: string       // 자유 입력 (골프, 테니스, 수영 등)
}

export interface ChecklistItem {
  id: string
  category: string
  item: string
  required: boolean
  checked: boolean
}

export interface VisaInfo {
  required: boolean
  duration: string
  howToApply: string
}

export interface TripResult {
  input: TripInput
  weatherTips: string
  visaInfo: VisaInfo
  countryTips: string[]
  checklist: ChecklistItem[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
```

- [ ] **Step 2: 커밋**

```bash
git add types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: 프롬프트 템플릿

**Files:**
- Create: `lib/prompts.ts`
- Test: `__tests__/lib/prompts.test.ts`

- [ ] **Step 1: 테스트 작성**

`__tests__/lib/prompts.test.ts`:

```typescript
import { buildGeneratePrompt } from '@/lib/prompts'

describe('buildGeneratePrompt', () => {
  it('입력값을 포함한 프롬프트를 반환한다', () => {
    const prompt = buildGeneratePrompt({
      itinerary: [
        { country: '일본', city: '도쿄', startDate: '2026-05-01', endDate: '2026-05-07' }
      ],
      travelers: 2,
      theme: '골프',
    })
    expect(prompt).toContain('도쿄')
    expect(prompt).toContain('2026-05-01')
    expect(prompt).toContain('골프')
    expect(prompt).toContain('JSON')
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npx jest __tests__/lib/prompts.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/prompts'"

- [ ] **Step 3: 구현**

`lib/prompts.ts`:

```typescript
import { TripInput } from '@/types'

export function buildGeneratePrompt(input: TripInput): string {
  return `당신은 여행 전문가입니다. 아래 여행 정보를 바탕으로 맞춤형 여행 준비 가이드를 JSON 형식으로 작성해주세요.

## 여행 정보
- 여정:
${input.itinerary.map(leg => `  * ${leg.country} ${leg.city} (${leg.startDate} ~ ${leg.endDate})`).join('\n')}
- 인원: ${input.travelers}명
- 여행 테마: ${input.theme || '일반 관광'}

## 출력 형식 (반드시 아래 JSON만 반환, 다른 텍스트 없이)

{
  "admin_tips": {
    "administrative": ["국가별 비자/입국 서류 내용"],
    "finance": ["국가별 통화/결제/환전 팁"],
    "digital": ["앱 다운로드, 통신/기차 앱 등"],
    "precautions": ["국가별 전압, 치안 주의사항 등"]
  },
  "checklist": [
    { "type": "essential", "item": "여권" },
    { "type": "recommended", "item": "키워드 기반 추천품", "reason": "이유" }
  ]
}

여행 테마(${input.theme || '일반 관광'})에 맞는 특수 준비물과 각 국가별 차이점을 명확히 비교해서 작성하세요.`
}

export function buildSystemPrompt(input: TripInput): string {
  const destString = input.itinerary.map(l => l.city).join(', ')
  return `당신은 여행 전문가 어시스턴트입니다. 사용자는 ${destString}을(를) 방문하는 일정으로 ${input.travelers}명이 ${input.theme || '일반 관광'} 여행을 준비 중입니다. 이 컨텍스트를 바탕으로 여행 준비에 관한 질문에 답해주세요. 새로운 짐 항목을 추천할 때는 응답 마지막에 다음 형식을 추가하세요: [SUGGEST_ITEM: {"category": "선택", "item": "아이템명"}]`
}
```

- [ ] **Step 4: 테스트 실행 (통과 확인)**

```bash
npx jest __tests__/lib/prompts.test.ts
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/prompts.ts __tests__/lib/prompts.test.ts
git commit -m "feat: add Claude prompt templates"
```

---

## Task 4: URL 공유 유틸리티

**Files:**
- Create: `lib/share.ts`
- Test: `__tests__/lib/share.test.ts`

- [ ] **Step 1: 테스트 작성**

`__tests__/lib/share.test.ts`:

```typescript
import { encodeResult, decodeResult } from '@/lib/share'
import { TripResult } from '@/types'

const mockResult = {
  input: {
    itinerary: [
      { country: '일본', city: '도쿄', startDate: '2026-05-01', endDate: '2026-05-07' }
    ],
    travelers: 2,
    theme: '골프',
  },
  admin_tips: {
    administrative: ['무비자 90일 체류 가능'],
    finance: ['트래블카드 추천'],
    digital: ['파파고, 구글맵 추천'],
    precautions: ['110V 돼지코 필수'],
  },
  checklist: [{ id: '1', type: 'essential', item: '여권', tested: false }],
}

describe('share utilities', () => {
  it('인코딩 후 디코딩하면 원본과 같다', () => {
    const encoded = encodeResult(mockResult)
    const decoded = decodeResult(encoded)
    expect(decoded).toEqual(mockResult)
  })

  it('encodeResult는 문자열을 반환한다', () => {
    expect(typeof encodeResult(mockResult)).toBe('string')
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npx jest __tests__/lib/share.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/share'"

- [ ] **Step 3: 구현**

`lib/share.ts`:

```typescript
import { TripResult } from '@/types'

export function encodeResult(result: TripResult): string {
  const json = JSON.stringify(result)
  return Buffer.from(json).toString('base64url')
}

export function decodeResult(encoded: string): TripResult | null {
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf-8')
    return JSON.parse(json) as TripResult
  } catch {
    return null
  }
}
```

- [ ] **Step 4: 테스트 실행 (통과 확인)**

```bash
npx jest __tests__/lib/share.test.ts
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/share.ts __tests__/lib/share.test.ts
git commit -m "feat: add URL share encode/decode utilities"
```

---

## Task 5: Claude API Route — 초기 결과 생성

**Files:**
- Create: `lib/claude.ts`
- Create: `app/api/generate/route.ts`

- [ ] **Step 1: Claude 클라이언트 작성**

`lib/claude.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

- [ ] **Step 2: API Route 작성**

`app/api/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { buildGeneratePrompt } from '@/lib/prompts'
import { TripInput, TripResult, ChecklistItem } from '@/types'

export async function POST(req: NextRequest) {
  const input: TripInput = await req.json()

  if (!input.itinerary || input.itinerary.length === 0 || !input.travelers) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: buildGeneratePrompt(input),
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)

    const result: TripResult = {
      input,
      weatherTips: parsed.weatherTips,
      visaInfo: parsed.visaInfo,
      countryTips: parsed.countryTips,
      checklist: parsed.checklist.map((item: Omit<ChecklistItem, 'id' | 'checked'>, i: number) => ({
        ...item,
        id: `item-${i}`,
        checked: false,
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json({ error: 'AI 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

- [ ] **Step 3: 로컬에서 API 동작 확인**

```bash
npm run dev
# 별도 터미널에서:
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"destination":"일본 도쿄","startDate":"2026-05-01","endDate":"2026-05-07","travelers":2,"theme":"골프"}'
```

Expected: TripResult JSON 반환

- [ ] **Step 4: 커밋**

```bash
git add lib/claude.ts app/api/generate/route.ts
git commit -m "feat: add Claude API generate route"
```

---

## Task 6: 입력 폼 컴포넌트

**Files:**
- Create: `components/TripForm.tsx`
- Test: `__tests__/components/TripForm.test.tsx`

- [ ] **Step 1: 테스트 작성**

`__tests__/components/TripForm.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TripForm from '@/components/TripForm'

describe('TripForm', () => {
  it('필수 필드가 모두 렌더링된다', () => {
    render(<TripForm onSubmit={jest.fn()} isLoading={false} />)
    expect(screen.getByPlaceholderText(/목적지/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/출발일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/귀국일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/인원/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/여행 테마/i)).toBeInTheDocument()
  })

  it('값을 입력하고 제출하면 onSubmit이 호출된다', async () => {
    const onSubmit = jest.fn()
    render(<TripForm onSubmit={onSubmit} isLoading={false} />)

    await userEvent.type(screen.getByPlaceholderText(/목적지/i), '일본 도쿄')
    fireEvent.change(screen.getByLabelText(/출발일/i), { target: { value: '2026-05-01' } })
    fireEvent.change(screen.getByLabelText(/귀국일/i), { target: { value: '2026-05-07' } })
    fireEvent.change(screen.getByLabelText(/인원/i), { target: { value: '2' } })

    fireEvent.click(screen.getByRole('button', { name: /체크리스트 생성/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ destination: '일본 도쿄' }))
  })

  it('isLoading이 true이면 버튼이 비활성화된다', () => {
    render(<TripForm onSubmit={jest.fn()} isLoading={true} />)
    expect(screen.getByRole('button', { name: /생성 중/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npx jest __tests__/components/TripForm.test.tsx
```

Expected: FAIL — "Cannot find module '@/components/TripForm'"

- [ ] **Step 3: 구현**

`components/TripForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { TripInput } from '@/types'

interface Props {
  onSubmit: (input: TripInput) => void
  isLoading: boolean
}

export default function TripForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<TripInput>({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    theme: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'travelers' ? Number(value) : value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold">여행 짐 체크리스트 만들기</h1>

      <div>
        <input
          name="destination"
          value={form.destination}
          onChange={handleChange}
          placeholder="목적지 (예: 일본 도쿄)"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="startDate" className="block text-sm mb-1">출발일</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="endDate" className="block text-sm mb-1">귀국일</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="travelers" className="block text-sm mb-1">인원</label>
        <input
          id="travelers"
          name="travelers"
          type="number"
          min={1}
          max={20}
          value={form.travelers}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <textarea
          name="theme"
          value={form.theme}
          onChange={handleChange}
          placeholder="여행 테마를 자유롭게 입력하세요 (예: 골프, 테니스, 가족 수영여행, 비즈니스 출장)"
          rows={3}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {isLoading ? '생성 중...' : '체크리스트 생성'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: 테스트 실행 (통과 확인)**

```bash
npx jest __tests__/components/TripForm.test.tsx
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add components/TripForm.tsx __tests__/components/TripForm.test.tsx
git commit -m "feat: add TripForm input component"
```

---

## Task 7: 체크리스트 컴포넌트

**Files:**
- Create: `components/ChecklistItem.tsx`
- Create: `components/Checklist.tsx`
- Test: `__tests__/components/Checklist.test.tsx`

- [ ] **Step 1: 테스트 작성**

`__tests__/components/Checklist.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Checklist from '@/components/Checklist'
import { ChecklistItem } from '@/types'

const mockItems: ChecklistItem[] = [
  { id: '1', category: '서류', item: '여권', required: true, checked: false },
  { id: '2', category: '서류', item: '여행자 보험', required: false, checked: false },
  { id: '3', category: '의류', item: '반팔 티셔츠', required: true, checked: true },
]

describe('Checklist', () => {
  it('카테고리별로 그룹화하여 렌더링한다', () => {
    render(<Checklist items={mockItems} onToggle={jest.fn()} />)
    expect(screen.getByText('서류')).toBeInTheDocument()
    expect(screen.getByText('의류')).toBeInTheDocument()
    expect(screen.getByText('여권')).toBeInTheDocument()
  })

  it('항목 클릭 시 onToggle이 해당 id로 호출된다', () => {
    const onToggle = jest.fn()
    render(<Checklist items={mockItems} onToggle={onToggle} />)
    fireEvent.click(screen.getByLabelText('여권'))
    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('checked 항목은 체크박스가 체크된 상태로 표시된다', () => {
    render(<Checklist items={mockItems} onToggle={jest.fn()} />)
    expect(screen.getByLabelText('반팔 티셔츠')).toBeChecked()
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npx jest __tests__/components/Checklist.test.tsx
```

Expected: FAIL

- [ ] **Step 3: ChecklistItem 구현**

`components/ChecklistItem.tsx`:

```typescript
import { ChecklistItem as Item } from '@/types'

interface Props {
  item: Item
  onToggle: (id: string) => void
}

export default function ChecklistItem({ item, onToggle }: Props) {
  return (
    <li className="flex items-center gap-2 py-1">
      <input
        id={item.id}
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id)}
        aria-label={item.item}
        className="w-4 h-4"
      />
      <label
        htmlFor={item.id}
        className={`text-sm ${item.checked ? 'line-through text-gray-400' : ''}`}
      >
        {item.item}
        {item.required && <span className="ml-1 text-red-500 text-xs">필수</span>}
      </label>
    </li>
  )
}
```

- [ ] **Step 4: Checklist 구현**

`components/Checklist.tsx`:

```typescript
import { ChecklistItem as Item } from '@/types'
import ChecklistItemComponent from './ChecklistItem'

interface Props {
  items: Item[]
  onToggle: (id: string) => void
}

export default function Checklist({ items, onToggle }: Props) {
  const categories = Array.from(new Set(items.map(i => i.category)))

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <div key={category}>
          <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">{category}</h3>
          <ul>
            {items
              .filter(i => i.category === category)
              .map(item => (
                <ChecklistItemComponent key={item.id} item={item} onToggle={onToggle} />
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: 테스트 실행 (통과 확인)**

```bash
npx jest __tests__/components/Checklist.test.tsx
```

Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add components/ChecklistItem.tsx components/Checklist.tsx __tests__/components/Checklist.test.tsx
git commit -m "feat: add Checklist and ChecklistItem components"
```

---

## Task 8: 결과 페이지 컴포넌트

**Files:**
- Create: `components/WeatherTips.tsx`
- Create: `components/VisaInfo.tsx`
- Create: `components/CountryTips.tsx`
- Create: `components/ResultView.tsx`

- [ ] **Step 1: WeatherTips 구현**

`components/WeatherTips.tsx`:

```typescript
interface Props {
  tips: string
}

export default function WeatherTips({ tips }: Props) {
  return (
    <section className="bg-blue-50 rounded-lg p-4">
      <h2 className="font-bold text-lg mb-2">날씨 특이점</h2>
      <p className="text-gray-700 text-sm">{tips}</p>
    </section>
  )
}
```

- [ ] **Step 2: VisaInfo 구현**

`components/VisaInfo.tsx`:

```typescript
import { VisaInfo as Info } from '@/types'

interface Props {
  info: Info
}

export default function VisaInfo({ info }: Props) {
  return (
    <section className="bg-yellow-50 rounded-lg p-4">
      <h2 className="font-bold text-lg mb-2">비자 정보</h2>
      <div className="text-sm space-y-1">
        <p>
          <span className="font-medium">비자 필요 여부: </span>
          <span className={info.required ? 'text-red-600' : 'text-green-600'}>
            {info.required ? '비자 필요' : '무비자'}
          </span>
        </p>
        <p><span className="font-medium">체류 기간: </span>{info.duration}</p>
        <p><span className="font-medium">신청 방법: </span>{info.howToApply}</p>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        ※ 본 정보는 참고용이며, 출국 전 반드시 해당 국가 대사관을 통해 확인하세요.
      </p>
    </section>
  )
}
```

- [ ] **Step 3: CountryTips 구현**

`components/CountryTips.tsx`:

```typescript
interface Props {
  tips: string[]
}

export default function CountryTips({ tips }: Props) {
  return (
    <section className="bg-green-50 rounded-lg p-4">
      <h2 className="font-bold text-lg mb-2">나라 꿀팁</h2>
      <ul className="list-disc list-inside space-y-1">
        {tips.map((tip, i) => (
          <li key={i} className="text-sm text-gray-700">{tip}</li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 4: ResultView 구현**

`components/ResultView.tsx`:

```typescript
'use client'

import { TripResult } from '@/types'
import WeatherTips from './WeatherTips'
import VisaInfo from './VisaInfo'
import CountryTips from './CountryTips'
import Checklist from './Checklist'

interface Props {
  result: TripResult
  onToggle: (id: string) => void
}

export default function ResultView({ result, onToggle }: Props) {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {result.input.destination} 여행 준비 가이드
      </h1>
      <p className="text-gray-500 text-sm">
        {result.input.startDate} ~ {result.input.endDate} · {result.input.travelers}명
        {result.input.theme && ` · ${result.input.theme}`}
      </p>

      <WeatherTips tips={result.weatherTips} />
      <VisaInfo info={result.visaInfo} />
      <CountryTips tips={result.countryTips} />

      <section>
        <h2 className="font-bold text-lg mb-3">짐 체크리스트</h2>
        <Checklist items={result.checklist} onToggle={onToggle} />
      </section>
    </div>
  )
}
```

- [ ] **Step 5: 커밋**

```bash
git add components/WeatherTips.tsx components/VisaInfo.tsx components/CountryTips.tsx components/ResultView.tsx
git commit -m "feat: add result view section components"
```

---

## Task 9: 랜딩 페이지 & 결과 페이지 연결

**Files:**
- Modify: `app/page.tsx`
- Create: `app/result/page.tsx`

- [ ] **Step 1: 랜딩 페이지 (입력 폼)**

`app/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TripForm from '@/components/TripForm'
import { TripInput, TripResult } from '@/types'
import { encodeResult } from '@/lib/share'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(input: TripInput) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'AI 생성 중 오류가 발생했습니다.')
      }

      const result: TripResult = await res.json()
      const encoded = encodeResult(result)
      router.push(`/result?data=${encoded}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-12">
      {error && (
        <div className="max-w-lg mx-auto mb-4 bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold">✕</button>
        </div>
      )}
      <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
    </main>
  )
}
```

- [ ] **Step 2: 결과 페이지**

`app/result/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TripResult } from '@/types'
import { decodeResult } from '@/lib/share'
import ResultView from '@/components/ResultView'
import PdfExport from '@/components/PdfExport'
import ShareButton from '@/components/ShareButton'

export default function ResultPage() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<TripResult | null>(null)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      const decoded = decodeResult(data)
      setResult(decoded)
    }
  }, [searchParams])

  function handleToggle(id: string) {
    if (!result) return
    setResult(prev => {
      if (!prev) return prev
      return {
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      }
    })
  }

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">결과를 불러오는 중...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12">
      <ResultView result={result} onToggle={handleToggle} />
      <div className="max-w-2xl mx-auto px-6 flex gap-3 mt-6">
        <PdfExport result={result} />
        <ShareButton />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: 로컬 동작 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → 목적지/일정/인원/테마 입력 → 생성 버튼 클릭 → 결과 페이지 확인

- [ ] **Step 4: 커밋**

```bash
git add app/page.tsx app/result/page.tsx
git commit -m "feat: wire landing page and result page"
```

---

## Task 10: PDF 저장 & URL 공유

**Files:**
- Create: `lib/pdf.ts`
- Create: `components/PdfExport.tsx`
- Create: `components/ShareButton.tsx`

- [ ] **Step 1: PDF 생성 유틸리티**

`lib/pdf.ts`:

```typescript
export async function exportToPdf(elementId: string, filename: string) {
  const html2canvas = (await import('html2canvas')).default
  const jsPDF = (await import('jspdf')).default

  const element = document.getElementById(elementId)
  if (!element) throw new Error('Element not found')

  const canvas = await html2canvas(element, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const imgWidth = pageWidth - 20
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
  pdf.save(filename)
}
```

- [ ] **Step 2: PdfExport 컴포넌트**

`components/PdfExport.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { TripResult } from '@/types'
import { exportToPdf } from '@/lib/pdf'

interface Props {
  result: TripResult
}

export default function PdfExport({ result }: Props) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const filename = `${result.input.destination}-체크리스트.pdf`
      await exportToPdf('result-content', filename)
    } catch {
      alert('PDF 저장 중 오류가 발생했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex-1 bg-gray-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
    >
      {isExporting ? '저장 중...' : 'PDF 저장'}
    </button>
  )
}
```

- [ ] **Step 3: ResultView에 id 추가**

`components/ResultView.tsx` 의 최상단 div에 `id="result-content"` 추가:

```typescript
<div id="result-content" className="max-w-2xl mx-auto p-6 space-y-6">
```

- [ ] **Step 4: ShareButton 컴포넌트**

`components/ShareButton.tsx`:

```typescript
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
      className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm"
    >
      {copied ? '복사됨!' : '링크 공유'}
    </button>
  )
}
```

- [ ] **Step 5: 로컬 동작 확인**

```bash
npm run dev
```

결과 페이지에서 "PDF 저장" 클릭 → PDF 다운로드 확인  
"링크 공유" 클릭 → 클립보드에 URL 복사 확인

- [ ] **Step 6: 커밋**

```bash
git add lib/pdf.ts components/PdfExport.tsx components/ShareButton.tsx components/ResultView.tsx
git commit -m "feat: add PDF export and URL share"
```

---

## Task 11: 전체 테스트 & 빌드 확인

- [ ] **Step 1: 전체 테스트 실행**

```bash
npx jest --coverage
```

Expected: 모든 테스트 PASS

- [ ] **Step 2: TypeScript 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 프로덕션 빌드**

```bash
npm run build
```

Expected: 빌드 성공

- [ ] **Step 4: 커밋**

```bash
git add .
git commit -m "chore: verify all tests pass and build succeeds"
```

---

## Task 12 (P1 선택): Supabase 로그인 & 여행 저장

> **시간 여유가 있을 때만 진행**

**Files:**
- Create: `lib/supabase.ts`
- Create: `supabase/migrations/001_initial.sql`
- Create: `app/api/trips/route.ts`

- [ ] **Step 1: DB 마이그레이션 작성**

`supabase/migrations/001_initial.sql`:

```sql
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  destination text not null,
  start_date date not null,
  end_date date not null,
  travelers int not null,
  theme text,
  result_data jsonb not null,
  created_at timestamptz default now()
);

alter table trips enable row level security;

create policy "Users can view own trips"
  on trips for select using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on trips for insert with check (auth.uid() = user_id);
```

- [ ] **Step 2: Supabase 클라이언트**

`lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

- [ ] **Step 3: 마이그레이션 적용**

```bash
npx supabase db push
```

- [ ] **Step 4: 결과 페이지에 저장 버튼 추가**

로그인 상태면 "내 여행에 저장" 버튼 표시. 클릭 시 `/api/trips` POST 호출로 Supabase에 저장.

- [ ] **Step 5: 커밋**

```bash
git add lib/supabase.ts supabase/ app/api/trips/
git commit -m "feat: add Supabase login and trip save"
```

---

## Task 13 (P2 선택): AI 채팅창

> **시간 여유가 있을 때만 진행**

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `components/ChatWidget.tsx`

- [ ] **Step 1: 채팅 API Route**

`app/api/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { buildSystemPrompt } from '@/lib/prompts'
import { TripInput, ChatMessage } from '@/types'

export async function POST(req: NextRequest) {
  const { input, messages }: { input: TripInput; messages: ChatMessage[] } = await req.json()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildSystemPrompt(input),
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // 새 짐 항목 추천 파싱
  const suggestMatch = text.match(/\[SUGGEST_ITEM: ({.*?})\]/)
  const suggestedItem = suggestMatch ? JSON.parse(suggestMatch[1]) : null
  const cleanText = text.replace(/\[SUGGEST_ITEM:.*?\]/, '').trim()

  return NextResponse.json({ text: cleanText, suggestedItem })
}
```

- [ ] **Step 2: ChatWidget 컴포넌트**

`components/ChatWidget.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { TripInput, ChatMessage, ChecklistItem } from '@/types'

interface Props {
  input: TripInput
  onAddItem: (item: Omit<ChecklistItem, 'id' | 'checked'>) => void
}

export default function ChatWidget({ input, onAddItem }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSend() {
    if (!userInput.trim()) return
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }]
    setMessages(newMessages)
    setUserInput('')
    setIsLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, messages: newMessages }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.text }])

    if (data.suggestedItem) {
      // 추가 버튼은 마지막 AI 메시지와 함께 표시 (별도 상태 없이 suggestedItem을 메시지에 임베드)
    }
    setIsLoading(false)
  }

  return (
    <section className="max-w-2xl mx-auto px-6 mt-8 border-t pt-6">
      <h2 className="font-bold text-lg mb-3">AI에게 더 물어보기</h2>
      <div className="border rounded-lg p-4 h-64 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm">준비물에 대해 자유롭게 질문하세요.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${
              m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {m.content}
            </span>
          </div>
        ))}
        {isLoading && <p className="text-gray-400 text-sm">답변 생성 중...</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="예: 골프채 케이스 뭐가 좋아요?"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: 결과 페이지에 ChatWidget 추가**

`app/result/page.tsx` 하단에 추가:

```typescript
import ChatWidget from '@/components/ChatWidget'

// ResultView 아래에 추가
<ChatWidget
  input={result.input}
  onAddItem={(item) => {
    setResult(prev => {
      if (!prev) return prev
      const newItem = { ...item, id: `chat-${Date.now()}`, checked: false }
      return { ...prev, checklist: [...prev.checklist, newItem] }
    })
  }}
/>
```

- [ ] **Step 4: 커밋**

```bash
git add app/api/chat/route.ts components/ChatWidget.tsx app/result/page.tsx
git commit -m "feat: add AI chat widget for additional recommendations"
```

---

## Task 14: Vercel 배포

- [ ] **Step 1: Vercel CLI 설치 및 배포**

```bash
npx vercel --prod
```

- [ ] **Step 2: 환경변수 설정**

Vercel 대시보드에서:
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 3: 배포 URL에서 동작 확인**

브라우저에서 배포 URL 접속 → 전체 흐름 확인 (입력 → 결과 → PDF → 공유)

- [ ] **Step 4: 최종 커밋**

```bash
git add .
git commit -m "chore: final deployment verification"
```
