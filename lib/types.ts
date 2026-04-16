export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type Gender = "Male" | "Female" | "Other"

export interface Patient {
  id: string
  user_id: string
  name: string
  age: number
  gender: Gender
  ward_bed: string
  diagnosis: string
  admission_date: string
  is_discharged: boolean
  created_at: string
}

export interface Note {
  id: string
  patient_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Task {
  id: string
  patient_id: string
  user_id: string
  title: string
  status: TaskStatus
  is_handover: boolean
  priority: TaskPriority
  created_at: string
  updated_at: string
}

export interface PatientWithCounts extends Patient {
  pending_tasks: number
  highest_priority: TaskPriority | null
}
