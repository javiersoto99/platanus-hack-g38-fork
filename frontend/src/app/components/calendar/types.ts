export interface CalendarEvent {
  id: string
  date: number
  title: string
  time: string
  type: "medicine"
  description: string
  status?: "pending" | "success" | "failed"
  retries?: number
  maxRetries?: number
  contactMethod?: "whatsapp" | "call"
  duration?: number
}
