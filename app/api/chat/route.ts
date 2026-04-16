import { NextRequest, NextResponse } from 'next/server'
import { genAI } from '@/lib/gemini'
import { buildSystemPrompt } from '@/lib/prompts'
import { TripInput, ChatMessage } from '@/types'

export const maxDuration = 60 // Vercel hobby tier timeout prevention

export async function POST(req: NextRequest) {
  try {
    const { input, messages }: { input: TripInput; messages: ChatMessage[] } = await req.json()

    if (!input || !messages) {
      return NextResponse.json({ error: '필수 데이터가 없습니다.' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: buildSystemPrompt(input),
    })

    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    })

    const lastUserMessage = messages[messages.length - 1].content
    const result = await chat.sendMessage(lastUserMessage)
    const text = result.response.text()

    // Parse suggest item if Gemini outputs [SUGGEST_ITEM: {"type": "recommended", "item": "아이템"}]
    const suggestMatch = text.match(/\[SUGGEST_ITEM:.*?(\{.*?\})\]/)
    let suggestedItem = null
    let cleanText = text
    
    if (suggestMatch) {
      try {
        suggestedItem = JSON.parse(suggestMatch[1])
        cleanText = text.replace(/\[SUGGEST_ITEM:.*?\]/, '').trim()
      } catch (e) {
        console.error('Failed to parse suggested item', e)
      }
    }

    return NextResponse.json({ text: cleanText, suggestedItem })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: '채팅 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
