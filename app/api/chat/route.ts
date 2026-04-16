import { NextRequest, NextResponse } from 'next/server'
import { genAI } from '@/lib/gemini'
import { buildSystemPrompt } from '@/lib/prompts'
import { TripInput, ChatMessage } from '@/types'

export const maxDuration = 60 // Vercel hobby tier timeout prevention

export async function POST(req: NextRequest) {
  try {
    const { input, messages }: { input: TripInput; messages: ChatMessage[] } = await req.json()

    if (!input || !messages || messages.length === 0) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: buildSystemPrompt(input),
    })

    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    })

    const userMessage = messages[messages.length - 1].content
    const result = await chat.sendMessage(userMessage)
    const responseText = result.response.text()

    // Check if the AI suggested an item to add
    const suggestMatch = responseText.match(/\[SUGGEST_ITEM:\s*({[^}]+})\s*\]/)
    let suggestedItem = null

    if (suggestMatch && suggestMatch[1]) {
      try {
        suggestedItem = JSON.parse(suggestMatch[1])
      } catch (e) {
        console.error('Failed to parse suggested item', e)
      }
    }

    const cleanText = responseText.replace(/\[SUGGEST_ITEM:[^\]]+\]/g, '').trim()

    return NextResponse.json({
      text: cleanText,
      suggestedItem,
    })
  } catch (error: any) {
    console.error('Gemini Chat API error:', error)
    return NextResponse.json({ 
      error: '채팅 중 오류가 발생했습니다.',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
