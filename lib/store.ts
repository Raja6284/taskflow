"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Task } from "@/lib/types"
import { addDays, addMonths, addWeeks, addYears, isBefore } from "date-fns"

interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom"
  interval?: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  monthOfYear?: number
  endDate?: Date
  unit?: "day" | "week" | "month" | "year"
}

interface TaskState {
  tasks: Task[]
  addTask: (task: Task) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  updateTask: (id: string, task: Partial<Task>) => void
  generateRecurringInstances: () => void
  setTasks: (tasks: Task[]) => void // Add this function
}

// Custom storage to handle date serialization/deserialization
const customStorage = createJSONStorage(() => localStorage, {
  reviver: (key, value) => {
    // Check if the value is a date string (ISO format)
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value)
    }
    return value
  },
})

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      updateTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task)),
        })),

      generateRecurringInstances: () => {
        const { tasks } = get()
        const today = new Date()
        const newTasks: Task[] = []

        // Look for completed tasks with recurrence patterns
        tasks.forEach((task) => {
          if (task.completed && task.recurrence && task.dueDate) {
            // Calculate the next occurrence
            const nextDate = calculateNextOccurrence(task.dueDate, task.recurrence)

            // If there's a valid next date and it's not past the end date
            if (nextDate && (!task.recurrence.endDate || isBefore(nextDate, task.recurrence.endDate))) {
              // Create a new task instance
              const newTask: Task = {
                id: Date.now().toString(),
                title: task.title,
                completed: false,
                createdAt: new Date(),
                dueDate: nextDate,
                recurrence: task.recurrence,
              }

              newTasks.push(newTask)
            }
          }
        })

        // Add the new recurring task instances
        if (newTasks.length > 0) {
          set((state) => ({
            tasks: [...state.tasks, ...newTasks],
          }))
        }
      },
    }),
    {
      name: "task-storage",
      storage: customStorage,
    },
  ),
)

function calculateNextOccurrence(currentDate: Date, pattern: RecurrencePattern): Date | null {
  const { frequency, interval = 1, daysOfWeek, dayOfMonth, monthOfYear } = pattern

  switch (frequency) {
    case "daily":
      return addDays(currentDate, interval)

    case "weekly":
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find the next day of week that matches the pattern
        let nextDate = addDays(currentDate, 1)
        while (!daysOfWeek.includes(nextDate.getDay())) {
          nextDate = addDays(nextDate, 1)
        }
        return nextDate
      }
      return addWeeks(currentDate, interval)

    case "monthly":
      if (dayOfMonth) {
        // Create a date for the next month with the specified day
        const nextMonth = addMonths(currentDate, interval)
        const result = new Date(nextMonth)
        result.setDate(Math.min(dayOfMonth, getDaysInMonth(result.getFullYear(), result.getMonth())))
        return result
      }
      return addMonths(currentDate, interval)

    case "yearly":
      if (dayOfMonth && monthOfYear) {
        // Create a date for the next year with the specified month and day
        const nextYear = addYears(currentDate, interval)
        const result = new Date(nextYear)
        result.setMonth(monthOfYear - 1)
        result.setDate(Math.min(dayOfMonth, getDaysInMonth(result.getFullYear(), monthOfYear - 1)))
        return result
      }
      return addYears(currentDate, interval)

    case "custom":
      switch (pattern.unit) {
        case "day":
          return addDays(currentDate, interval)
        case "week":
          return addWeeks(currentDate, interval)
        case "month":
          return addMonths(currentDate, interval)
        case "year":
          return addYears(currentDate, interval)
        default:
          return addDays(currentDate, interval)
      }

    default:
      return null
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}
