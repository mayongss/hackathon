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
    { "category": "필수 서류", "type": "essential", "item": "여권" },
    { "category": "세면도구", "type": "recommended", "item": "키워드 기반 추천품", "reason": "이유" }
    // 아래 항목들을 포함하여 최소 20~30개 이상의 아주 상세한 물품을 작성해주세요.
    // 주의: 'category' 값은 반드시 다음 중 하나만 사용하세요: ["필수 서류", "의류", "세면도구", "전자기기", "상비약", "기타"]
    // 다른 카테고리 이름(예: 옷차림, 옷가지 등)은 절대 만들지 마세요.
  ]
}

- 여행 테마(${input.theme || '일반 관광'})에 맞는 특수 준비물과 각 국가별 차이점을 명확히 비교하세요.
- **매우 중요**: 일정을 분석하여 각 여행지의 기후와 날씨를 예측하고 그에 맞는 구체적인 옷차림(예: 얇은 가디건, 두꺼운 패딩 등)을 반드시 'checklist'에 많이 포함시켜 주세요.
- 모든 필수 여행 준비물(세면도구, 전자기기 등)을 빠짐없이 세세하게 나열해주세요.`
}

export function buildSystemPrompt(input: TripInput): string {
  const destString = input.itinerary.map(l => l.city).join(', ')
  return `당신은 여행 전문가 어시스턴트입니다. 사용자는 ${destString}을(를) 방문하는 일정으로 ${input.travelers}명이 ${input.theme || '일반 관광'} 여행을 준비 중입니다. 이 컨텍스트를 바탕으로 여행 준비에 관한 질문에 답해주세요. 새로운 짐 항목을 추천할 때는 응답 마지막에 다음 형식을 추가하세요: [SUGGEST_ITEM: {"type": "recommended", "item": "아이템명"}]`
}
