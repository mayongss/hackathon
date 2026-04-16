import { ChecklistItem as Item } from '@/types'

interface Props {
  item: Item
  onToggle: (id: string) => void
  highlight?: boolean
}

export default function ChecklistItem({ item, onToggle, highlight }: Props) {
  // 체크 완료 시 "캐리어에 쏙" 애니메이션 클래스 적용
  const packedClass = item.checked ? 'item-packed opacity-50' : ''
  
  return (
    <label
      id={`checklist-item-${item.id}`}
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
        highlight 
          ? 'ring-4 ring-sky-300 bg-sky-50 border-sky-300 scale-[1.02] shadow-lg z-10 relative'
          : item.checked
            ? 'bg-slate-50 border-slate-200'
            : 'bg-white border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 shadow-sm'
      } ${packedClass}`}
    >
      <div className="flex-shrink-0 mt-0.5 z-10 relative">
        <input
          id={item.id}
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggle(item.id)}
          className="w-5 h-5 rounded border-gray-300 accent-sky-500 cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold flex items-center gap-2 flex-wrap ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          <span className="text-base">{item.item}</span>
          {item.type === 'essential' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-pink-100 text-pink-700 font-title">
              🚨 귀찮아도 이건 꼭!
            </span>
          )}
          {item.type === 'recommended' && !item.checked && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-700 font-title">
              💡 챙기면 여행 퀄리티 상승
            </span>
          )}
        </div>
        {!item.checked && item.reason && (
          <p className="text-xs mt-1.5 text-slate-500 leading-relaxed font-medium">
            <span className="opacity-70">💬</span> {item.reason}
          </p>
        )}
      </div>
    </label>
  )
}
