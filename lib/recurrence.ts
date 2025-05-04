export interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom"
  interval: number
  unit?: "day" | "week" | "month" | "year"
  daysOfWeek?: number[] // 0-6, Sunday to Saturday
  dayOfMonth?: number // 1-31
  monthOfYear?: number // 1-12
  endDate?: Date
}
