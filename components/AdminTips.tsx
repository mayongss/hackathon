import { AdminTips as Tips } from '@/types'

interface Props {
  tips: Tips
}

export default function AdminTips({ tips }: Props) {
  // Ensure we have an array of strings to iterate over
  const tipArray: string[] = Array.isArray(tips) ? tips : []


  return (
    <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
      <h4 className="flex items-center text-indigo-700 font-bold mb-4 text-lg">
        <span className="mr-2">💡</span> 알아두면 유용한 Top 5 필수 팁
      </h4>
      <ul className="space-y-3">
        {tipArray.slice(0, 5).map((tip, i) => (
          <li key={i} className="flex gap-3 text-[15px] border-b border-indigo-100/60 pb-3 last:border-0 last:pb-0 text-gray-800 leading-relaxed">
            <span className="text-indigo-500 font-bold shrink-0">{i + 1}.</span>
            <span>{tip.replace(/^[\*\-\s]+/, '')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
