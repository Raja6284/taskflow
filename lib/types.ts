export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  dueDate?: Date
  recurrence?: RecurrencePattern | null
}

export interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom"
  interval: number
  unit?: "day" | "week" | "month" | "year"
  daysOfWeek?: number[] // 0-6, Sunday to Saturday
  dayOfMonth?: number // 1-31
  monthOfYear?: number // 1-12
  endDate?: Date
}
