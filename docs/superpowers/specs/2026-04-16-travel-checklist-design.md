# 여행 체크리스트 서비스 — 설계 문서

**작성일:** 2026-04-16  
**스택:** Next.js (App Router) + Supabase + Claude API + Vercel

---

## 1. 서비스 개요

목적지, 일정, 인원, 여행 테마를 입력하면 AI가 맞춤형 짐 체크리스트, 날씨 특이점, 비자 정보, 나라 꿀팁을 생성해주는 웹 서비스. 한국 출발 기준 전 세계 국가 지원, 개인/그룹 여행자 모두 대상.

---

## 2. 화면 흐름 및 기능

### 필수 기능 (MVP)

**1. 입력 페이지 (랜딩)**
- 다중 목적지 일정 (Itinerary) 추가/삭제 기능
  - [방문 국가/도시 입력] + [도착일 ~ 출발일 선택] (여러 개 추가 가능, 순서대로 배열)
- 인원수 (숫자 입력)
- 여행 테마 (자유 텍스트, ex. 골프, 테니스, 수영, 다국가 유로스타 이동 등)
- "가보자" 버튼

**2. AI 결과 페이지**
- 날씨 특이점 (여행 기간 기준 현지 기후, 주의사항)
- 비자 정보 (한국 여권 기준, 무비자 여부, 기간, 신청 방법)
  - 면책 문구: "본 정보는 참고용이며, 출국 전 반드시 해당 국가 대사관을 통해 확인하세요."
- 나라 꿀팁 (교통, 문화, 주의사항, 환전, 통신 등)
- 짐 체크리스트 (카테고리별, 필수/권장 구분)

**3. 체크리스트 인터랙션**
- 항목별 체크/해제
- PDF 저장 (html2canvas 또는 react-pdf)
- 링크 공유 (URL 파라미터로 결과 공유)

### 선택 기능 (시간 여유 시)

**4. 로그인 & 마이페이지**
- Supabase Auth (이메일/소셜 로그인)
- 비로그인: 결과 보기 + PDF만 가능
- 로그인: 여행 저장, 마이페이지에서 내 여행 목록 관리

**5. AI 채팅창**
- 결과 페이지 하단에 채팅 UI
- 시스템 프롬프트에 여행 컨텍스트(목적지, 일정, 테마) 자동 주입
- 추가 준비물 질문 가능 (ex. "골프채 케이스 뭐가 좋아?")
- AI 응답에서 새 짐 항목 추천 시 "체크리스트에 추가" 버튼 노출

---

## 3. 아키텍처

```
사용자 브라우저
    ↕
Next.js App Router (프론트 + API Routes)
    ├── Supabase (PostgreSQL + Auth)
    └── Claude API (AI 생성)
        ├── 초기 결과 생성 (1회성)
        └── 채팅 (멀티턴, 선택)
```

**배포:** Vercel (Next.js 최적화)

---

## 4. 데이터 모델 (Supabase)

```sql
-- Supabase Auth가 users 테이블 자동 관리

-- 여행 정보
trips (
  id           uuid PRIMARY KEY,
  user_id      uuid REFERENCES auth.users,  -- null이면 비로그인
  itinerary    jsonb NOT NULL,               -- [{ country, city, start_date, end_date }, ...]
  travelers    int  NOT NULL,
  theme        text,                         -- 여행 테마 자유 입력
  created_at   timestamptz DEFAULT now()
)

-- 짐 체크리스트
checklist_items (
  id           uuid PRIMARY KEY,
  trip_id      uuid REFERENCES trips,
  category     text NOT NULL,               -- ex. 의류, 세면도구, 전자기기
  item_name    text NOT NULL,
  is_required  boolean DEFAULT false,
  checked      boolean DEFAULT false
)
```

비로그인 사용자: DB 저장 없이 브라우저 세션(메모리/localStorage)에만 유지.

---

## 5. AI 프롬프트 설계

### ① 초기 결과 생성 (1회성 호출)

**입력:** 여정 목록(국가/도시와 기간 배열), 인원수, 여행 테마  
**출력:** 구조화된 JSON (Admin & Tip, Packing List 구조 반영)

```json
{
  "admin_tips": {
    "administrative": ["국가별 비자/입국 서류 정보"],
    "finance": ["국가별 통화 및 환전/카드 사용 팁"],
    "digital": ["추천 교통, 배달 등 필수 앱 및 통신 팁"],
    "precautions": ["전압, 치안 등 주의사항"]
  },
  "checklist": [
    {
      "type": "essential",  // 필수 품목
      "item": "string"
    },
    {
      "type": "recommended", // 추천/선택 품목
      "item": "string",
      "reason": "키워드나 지형 특성에 따른 추천 이유"
    }
  ]
}
```

### ② AI 채팅 (멀티턴, 선택 기능)

- 시스템 프롬프트에 여행 컨텍스트 고정 주입
- 사용자 자유 질문 → AI 답변
- 새 짐 항목 추천 포함 시 별도 JSON 필드로 반환 → "추가" 버튼 노출

---

## 6. 에러 처리

| 상황 | 처리 방법 |
|------|-----------|
| AI 응답 지연 | 로딩 스피너 + 스켈레톤 UI |
| Claude API 실패 | "잠시 후 다시 시도해주세요" 토스트 + 재시도 버튼 |
| 비자 정보 불확실 | 면책 문구 항상 표시 |
| PDF 생성 실패 | 에러 토스트 표시 |

---

## 7. 우선순위 정리

| 우선순위 | 기능 |
|----------|------|
| P0 (필수) | 입력 폼, AI 결과 생성, 체크리스트 체크, PDF 저장 |
| P1 (선택) | 로그인/저장, 마이페이지 |
| P2 (선택) | AI 채팅창, 체크리스트 추가 |
