import { ChecklistItem as Item } from '@/types'
import ChecklistItemComponent from './ChecklistItem'

interface Props {
  items: Item[]
  onToggle: (id: string) => void
}

export default function Checklist({ items, onToggle }: Props) {
  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const category = item.category || '기타'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, Item[]>)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, catItems]) => (
        <section key={category}>
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-gray-800 bg-gray-200/60 rounded-lg px-3 py-1.5 mb-3 w-fit">
            🏷️ {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {catItems.map(item => (
              <ChecklistItemComponent key={item.id} item={item} onToggle={onToggle} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
