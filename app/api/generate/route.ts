import { NextRequest, NextResponse } from 'next/server'
import { genAI } from '@/lib/gemini'
import { buildGeneratePrompt } from '@/lib/prompts'
import { TripInput, TripResult, ChecklistItem } from '@/types'

export const maxDuration = 60 // Vercel hobby tier timeout prevention

export async function POST(req: NextRequest) {
  try {
    const input: TripInput = await req.json()

    if (!input.itinerary || input.itinerary.length === 0 || !input.travelers) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = buildGeneratePrompt(input)
    
    let result_ai;
    let retries = 3;
    let delay = 1500;
    
    while(true) {
      try {
        result_ai = await model.generateContent(prompt);
        break;
      } catch (err: any) {
        // 503 Service Unavailable or 429 Too Many Requests -> Retry
        if (retries > 0 && err.message && (err.message.includes('503') || err.message.includes('429'))) {
          retries--;
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // exponential backoff
        } else {
          throw err;
        }
      }
    }

    const text = result_ai.response.text()

    // Sometimes gemini wraps json in markdown codeblock
    const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    const result: TripResult = {
      input,
      admin_tips: parsed.admin_tips,
      checklist: parsed.checklist.map((item: Omit<ChecklistItem, 'id' | 'checked'>, i: number) => ({
        ...item,
        id: `item-${i}`,
        checked: false,
      })),
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ 
      error: 'AI 생성 중 오류가 발생했습니다.', 
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
