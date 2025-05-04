"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Calendar, Edit, Trash, X } from "lucide-react"
import type { Task } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { RecurrenceDialog } from "@/components/recurrence-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { RecurrencePattern } from "@/lib/recurrence"

interface TaskItemProps {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onUpdate: (task: Partial<Task>) => void
}

export function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [showRecurrenceDialog, setShowRecurrenceDialog] = useState(false)

  const handleEdit = () => {
    if (editTitle.trim()) {
      onUpdate({ title: editTitle })
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit()
    } else if (e.key === "Escape") {
      setEditTitle(task.title)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border",
        task.completed ? "bg-muted/50" : "bg-card",
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <Checkbox checked={task.completed} onCheckedChange={onToggle} id={`task-${task.id}`} />

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditTitle(task.title)
                setIsEditing(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex-1">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                "text-sm font-medium cursor-pointer",
                task.completed && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </label>

            {(task.dueDate || task.recurrence) && (
              <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                {task.dueDate && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {task.dueDate instanceof Date && !isNaN(task.dueDate.getTime())
                      ? format(task.dueDate, "MMM d, yyyy")
                      : "Invalid date"}
                  </div>
                )}

                {task.recurrence && (
                  <div className="cursor-pointer hover:text-foreground" onClick={() => setShowRecurrenceDialog(true)}>
                    Repeats: {getRecurrenceLabel(task.recurrence)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={task.dueDate}
                onSelect={(date) => onUpdate({ dueDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )}

      <RecurrenceDialog
        open={showRecurrenceDialog}
        onOpenChange={setShowRecurrenceDialog}
        onSave={(pattern) => {
          onUpdate({ recurrence: pattern })
          setShowRecurrenceDialog(false)
        }}
        initialPattern={task.recurrence}
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
