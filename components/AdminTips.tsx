import { AdminTips as Tips } from '@/types'

interface Props {
  tips: Tips
}

export default function AdminTips({ tips }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
        <h4 className="flex items-center text-indigo-700 font-bold mb-3">
          <span className="text-xl mr-2">🛂</span> 행정 &amp; 서류
        </h4>
        <ul className="space-y-2">
          {tips.administrative.map((tip, i) => (
            <li key={i} className="text-sm border-b border-indigo-100/60 pb-2 last:border-0 last:pb-0 text-gray-700">
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
        <h4 className="flex items-center text-emerald-700 font-bold mb-3">
          <span className="text-xl mr-2">💳</span> 금융 &amp; 결제
        </h4>
        <ul className="space-y-2">
          {tips.finance.map((tip, i) => (
            <li key={i} className="text-sm border-b border-emerald-100/60 pb-2 last:border-0 last:pb-0 text-gray-700">
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
        <h4 className="flex items-center text-purple-700 font-bold mb-3">
          <span className="text-xl mr-2">📱</span> 디지털 &amp; 앱
        </h4>
        <ul className="space-y-2">
          {tips.digital.map((tip, i) => (
            <li key={i} className="text-sm border-b border-purple-100/60 pb-2 last:border-0 last:pb-0 text-gray-700">
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
        <h4 className="flex items-center text-orange-700 font-bold mb-3">
          <span className="text-xl mr-2">⚠️</span> 현지 주의사항
        </h4>
        <ul className="space-y-2">
          {tips.precautions.map((tip, i) => (
            <li key={i} className="text-sm border-b border-orange-100/60 pb-2 last:border-0 last:pb-0 text-gray-700">
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
