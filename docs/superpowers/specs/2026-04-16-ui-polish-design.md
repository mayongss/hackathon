# UI Polish Design Spec
**Date:** 2026-04-16  
**Goal:** TravelAI 앱 전체 UI를 인디고/퍼플 그라디언트 + 글래스모피즘 스타일로 세련되게 개선한다.

---

## 디자인 방향

**B. 비비드 그라디언트** — 인디고(`#667eea`) → 퍼플(`#764ba2`) 그라디언트, 글래스모피즘 카드, 흰 배경 결과 영역.

---

## 변경 파일 & 세부 사항

### 1. `app/layout.tsx`
- `next/font/google`에서 Inter 폰트 로드 (variable: `--font-inter`)
- `<body>`에 폰트 클래스 적용

### 2. `app/globals.css`
- `font-family`를 Inter로 변경
- body 기본 배경색 `#f8faff` (연한 라벤더 화이트)

### 3. `app/page.tsx` (홈)
- `<main>` 배경을 `bg-gradient-to-br from-[#667eea] to-[#764ba2]` + `min-h-screen`
- 수직 중앙 정렬

### 4. `components/TripForm.tsx`
- 상단 타이틀 영역 추가: "✈️ TravelAI" + 부제목
- 카드: `bg-white/[0.12] backdrop-blur-md border border-white/25 rounded-2xl`
- 인풋 필드: `bg-white/15 border-white/20 text-white placeholder-white/50 rounded-xl`
- 레이블: `text-white/60 uppercase tracking-wide text-xs`
- "여정 추가" 버튼: `bg-white/10 text-white/70` 우측 정렬
- CTA 버튼: `bg-white text-[#6c47ff] font-bold rounded-xl shadow-lg`

### 5. `app/result/page.tsx`
- 배경: `bg-[#f8faff]`

### 6. `components/ResultView.tsx`
- 그라디언트 헤더 (`bg-gradient-to-br from-[#667eea] to-[#764ba2]`) + 흰 배경 바디
- 여정 배지: `bg-white/20 text-white rounded-full`
- 바디 카드: `bg-white rounded-t-2xl -mt-3 shadow-[0_-2px_12px_rgba(102,126,234,0.08)]`
- PDF/공유 버튼: 그라디언트 버튼 vs 아웃라인 버튼

### 7. `components/AdminTips.tsx`
- 행정: `bg-indigo-50 border-indigo-100` / 타이틀 `text-indigo-700`
- 금융: `bg-emerald-50` (유지)
- 디지털: `bg-purple-50 border-purple-100` / 타이틀 `text-purple-700`
- 주의사항: `bg-orange-50` (유지)

### 8. `components/Checklist.tsx` + `components/ChecklistItem.tsx`
- 필수 섹션 헤더 배지: `bg-violet-600 text-white`
- 체크된 항목: 보라색 체크박스 (`accent-violet-600`)
- 미체크 항목 배경: `bg-gray-50 border border-gray-100`
- 체크된 항목 배경: `bg-violet-50` + 취소선 + 흐리게

---

## 범위 외

- 기능 변경 없음 (API, 로직, 타입 불변)
- 반응형 브레이크포인트 기존 유지 (md: 기준)
- 다크 모드 미지원 (기존과 동일)
