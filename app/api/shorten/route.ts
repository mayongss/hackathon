import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
    
    if (!res.ok) {
      return NextResponse.json({ error: 'TinyURL failed' }, { status: 500 })
    }
    
    const shortUrl = await res.text()
    return NextResponse.json({ shortUrl })
  } catch (err: any) {
    console.error('Shorten error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
