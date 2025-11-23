// Backend DTO types (matching backend/dtos)
export interface ReminderResponse {
  id: number
  reminder_type: string
  periodicity: number | null
  start_date: string
  end_date: string | null
  medicine: number | null
  appointment_id: number | null
  elderly_profile_id: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface MedicineResponse {
  id: number
  name: string
  dosage: string | null
  total_tablets: number | null
  tablets_left: number | null
  tablets_per_dose: number | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ReminderInstanceResponse {
  id: number
  reminder_id: number
  scheduled_datetime: string
  status: string | null
  taken_at: string | null
  retry_count: number | null
  max_retries: number | null
  family_notified: boolean | null
  family_notified_at: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

// Frontend extended types (with related data)
export interface Reminder extends ReminderResponse {
  medicineData?: MedicineResponse
  instances?: ReminderInstanceResponse[]
}

export type Medicine = MedicineResponse

export interface ReminderInstance extends ReminderInstanceResponse {
  medicine_name?: string
  dosage?: string
  method?: "whatsapp" | "call"
}

// Legacy types for compatibility (deprecated, use ReminderInstance)
export interface ReminderExecution {
  id: number
  executed_at: string
  status: "success" | "failed" | "pending"
  method: "whatsapp" | "call"
  retries: number
  duration_minutes: number
}
