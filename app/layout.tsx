import type { Metadata } from 'next'
import { Noto_Sans_KR, Jua } from 'next/font/google'
import './globals.css'

const notoSans = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-sans'
})

const jua = Jua({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-jua'
})

export const metadata: Metadata = {
  title: '게으른 여행자 | The Lazy Packer',
  description: '신나는 여행만 생각하세요. 귀찮은 짐싸기는 AI가 완벽하게 끝낼게요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${notoSans.className} ${notoSans.variable} ${jua.variable} bg-[#f0f9ff]`}>{children}</body>
    </html>
  )
}
