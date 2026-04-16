import { ChecklistItem as Item } from '@/types'

interface Props {
  item: Item
  onToggle: (id: string) => void
}

export default function ChecklistItem({ item, onToggle }: Props) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
        item.checked
          ? 'bg-violet-50 border-violet-200'
          : 'bg-gray-50 border-gray-100 hover:border-violet-200 hover:bg-violet-50/30'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <input
          id={item.id}
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggle(item.id)}
          className="w-5 h-5 rounded accent-violet-600 cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium flex items-center gap-2 flex-wrap ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {item.item}
          {item.type === 'essential' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
              필수
            </span>
          )}
        </div>
        {item.reason && (
          <p className={`text-xs mt-1 ${item.checked ? 'text-gray-400' : 'text-indigo-500'}`}>
            💡 {item.reason}
          </p>
        )}
      </div>
    </label>
  )
}
