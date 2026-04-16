export interface TripItinerary {
  country: string
  city: string
  startDate: string   // YYYY-MM-DD
  endDate: string     // YYYY-MM-DD
}

export interface TripInput {
  itinerary: TripItinerary[]
  travelers: number
  theme: string       // 자유 입력 (골프, 테니스, 수영 등)
}

export interface ChecklistItem {
  id: string
  category: string
  type: 'essential' | 'recommended'
  item: string
  reason?: string
  checked: boolean
}

export type AdminTips = string[]

export interface TripResult {
  input: TripInput
  admin_tips: AdminTips
  checklist: ChecklistItem[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
