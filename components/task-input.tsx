"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTaskStore } from "@/lib/store"
import { RecurrenceDialog } from "@/components/recurrence-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Define the RecurrencePattern type
interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom"
  interval?: number
  unit?: "day" | "week" | "month" | "year"
  daysOfWeek?: number[]
}

export function TaskInput() {
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [showRecurrenceDialog, setShowRecurrenceDialog] = useState(false)
  const [recurrence, setRecurrence] = useState<RecurrencePattern | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addTask = useTaskStore((state) => state.addTask)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const newTask = {
        id: Date.now().toString(),
        title,
        completed: false,
        createdAt: new Date(),
        dueDate,
        recurrence,
      }

      addTask(newTask)

      // Reset form
      setTitle("")
      setDueDate(undefined)
      setRecurrence(null)
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={!title.trim() || isSubmitting}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add task</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Set due date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowRecurrenceDialog(true)}
            className={cn("flex-1", recurrence && "border-primary text-primary")}
            disabled={isSubmitting}
          >
            {recurrence ? `Repeats: ${getRecurrenceLabel(recurrence)}` : "Set recurrence"}
          </Button>
        </div>
      </form>

      <RecurrenceDialog
        open={showRecurrenceDialog}
        onOpenChange={setShowRecurrenceDialog}
        onSave={(pattern) => {
          setRecurrence(pattern)
          setShowRecurrenceDialog(false)
        }}
        initialPattern={recurrence}
      />
    </div>
  )
}

function getRecurrenceLabel(recurrence: RecurrencePattern): string {
  switch (recurrence.frequency) {
    case "daily":
      return "Daily"
    case "weekly":
      return `Weekly on ${recurrence.daysOfWeek?.map(dayToString).join(", ")}`
    case "monthly":
      return "Monthly"
    case "yearly":
      return "Yearly"
    case "custom":
      return `Every ${recurrence.interval} ${recurrence.unit}s`
    default:
      return "Custom"
  }
}

function dayToString(day: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[day]
}
