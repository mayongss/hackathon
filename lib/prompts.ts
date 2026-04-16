import { TripInput } from '@/types'

export function buildGeneratePrompt(input: TripInput): string {
  const destString = input.itinerary.map(l => l.country + ' ' + l.city).join(', ')
  const baseCategories = ["필수 서류", "의류", "세면도구", "전자기기", "상비약", "기타"];
  const dynamicCategories = input.theme ? [...baseCategories, `${input.theme}`] : baseCategories;
  
  const themeInstruction = input.theme 
    ? `- **중요**: 사용자가 입력한 테마("${input.theme}")와 관련된 모든 특수 준비물은 반드시 새로 생성한 "${input.theme}" 카테고리로 묶어서 응답하세요.`
    : `- 여행 테마에 맞는 맞춤형 준비물을 구체적으로 나열하세요.`;

  return `당신은 귀찮음이 많은 프로 여행자들을 대신해 캐리어를 싸주는 '게으른 여행자' AI 어시스턴트입니다. 
아래 여행 정보를 바탕으로 맞춤형 여행 준비 가이드를 JSON 형식으로 작성해주세요.

## 여행 정보
- 여정:
${input.itinerary.map(leg => `  * ${leg.country} ${leg.city} (${leg.startDate} ~ ${leg.endDate})`).join('\n')}
- 인원: ${input.travelers}명
- 여행 테마: ${input.theme || '없음'}

## 출력 형식 (반드시 아래 JSON만 반환, 다른 텍스트 없이)

{
  "admin_tips": ["행정/금융/디지털 준비사항 팁을 마크다운 불릿 포인트로 작성 (최대 5개 핵심 요약)", "여행지(${destString})에 특화된 필수적이고 크리티컬한 정보만 포함"],
  "checklist": [
    { "category": "필수 서류", "type": "essential", "item": "여권" },
    { "category": "세면도구", "type": "recommended", "item": "키워드 기반 추천품", "reason": "위트있고 센스있는 이유 (예: '이거 없으면 현지에서 엄청 고생해요', '귀찮아도 이건 챙겨가야 후회 안 함')" }
    // 아래 항목들을 포함하여 최소 20~30개 이상의 아주 상세한 물품을 작성해주세요.
    // 주의: 'category' 값은 반드시 다음 중 하나만 사용하세요: ${JSON.stringify(dynamicCategories)}
    // 다른 카테고리 이름은 절대 만들지 마세요.
    // 각 추천 아이템의 "reason" 에는 매우 가볍고 재치 있는 어투로 이 짐을 챙겨야 하는 이유를 작성해주세요.
  ]
}

${themeInstruction}
- **매우 중요**: 일정을 분석하여 각 여행지의 기후와 날씨를 예측하고 그에 맞는 구체적인 옷차림(예: 얇은 가디건, 두꺼운 패딩 등)을 반드시 'checklist'에 많이 포함시켜 주세요.
- 모든 필수 여행 준비물(세면도구, 전자기기 등)을 빠짐없이 세세하게 나열해주세요.`
}

export function buildSystemPrompt(input: TripInput): string {
  const destString = input.itinerary.map(l => l.city).join(', ')
  return `당신은 여행 전문가 어시스턴트입니다. 사용자는 ${destString}을(를) 방문하는 일정으로 ${input.travelers}명이 ${input.theme || '일반 관광'} 여행을 준비 중입니다. 이 컨텍스트를 바탕으로 여행 준비에 관한 질문에 답해주세요. 새로운 짐 항목을 추천할 때는 응답 마지막에 다음 형식을 추가하세요: [SUGGEST_ITEM: {"category": "기타", "type": "recommended", "item": "아이템명"}]`
}
