export interface Reminder {
  id: number
  reminder_type: string
  periodicity: string | null
  start_date: string
  end_date: string | null
  is_active: boolean
  medicine?: Medicine
  executions: ReminderExecution[]
}

export interface Medicine {
  id: number
  name: string
  dosage: string | null
  total_tablets: number | null
  tablets_left: number | null
  tablets_per_dose: number
  notes: string | null
}

export interface ReminderExecution {
  id: number
  executed_at: string
  status: "success" | "failed" | "pending"
  method: "whatsapp" | "call"
  retries: number
  duration_minutes: number
}

export interface ReminderInstance {
  id: number
  reminder_id: number
  scheduled_datetime: string
  status: "success" | "failed" | "pending"
  taken_at: string | null
  retry_count: number
  max_retries: number
  method: "whatsapp" | "call"
  medicine_name: string
  dosage: string
}
