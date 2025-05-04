"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { RecurrencePattern } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface RecurrenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (pattern: RecurrencePattern) => void
  initialPattern: RecurrencePattern | null
}

export function RecurrenceDialog({ open, onOpenChange, onSave, initialPattern }: RecurrenceDialogProps) {
  const [pattern, setPattern] = useState<RecurrencePattern>(
    initialPattern || {
      frequency: "daily",
      interval: 1,
      unit: "day",
    },
  )

  const [showEndDate, setShowEndDate] = useState(!!initialPattern?.endDate)

  useEffect(() => {
    if (initialPattern) {
      setPattern(initialPattern)
      setShowEndDate(!!initialPattern.endDate)
    } else {
      setPattern({
        frequency: "daily",
        interval: 1,
        unit: "day",
      })
      setShowEndDate(false)
    }
  }, [initialPattern, open])

  const handleFrequencyChange = (value: string) => {
    const frequency = value as RecurrencePattern["frequency"]

    const newPattern: RecurrencePattern = {
      ...pattern,
      frequency,
    }

    // Set default values based on frequency
    switch (frequency) {
      case "daily":
        newPattern.unit = "day"
        newPattern.interval = 1
        delete newPattern.daysOfWeek
        delete newPattern.dayOfMonth
        delete newPattern.monthOfYear
        break
      case "weekly":
        newPattern.unit = "week"
        newPattern.interval = 1
        newPattern.daysOfWeek = [new Date().getDay()]
        delete newPattern.dayOfMonth
        delete newPattern.monthOfYear
        break
      case "monthly":
        newPattern.unit = "month"
        newPattern.interval = 1
        newPattern.dayOfMonth = new Date().getDate()
        delete newPattern.daysOfWeek
        delete newPattern.monthOfYear
        break
      case "yearly":
        newPattern.unit = "year"
        newPattern.interval = 1
        newPattern.dayOfMonth = new Date().getDate()
        newPattern.monthOfYear = new Date().getMonth() + 1
        delete newPattern.daysOfWeek
        break
      case "custom":
        newPattern.unit = "day"
        newPattern.interval = 1
        delete newPattern.daysOfWeek
        delete newPattern.dayOfMonth
        delete newPattern.monthOfYear
        break
    }

    setPattern(newPattern)
  }

  const handleDayOfWeekToggle = (day: number) => {
    const currentDays = pattern.daysOfWeek || []
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day]

    setPattern({
      ...pattern,
      daysOfWeek: newDays.length > 0 ? newDays.sort() : [new Date().getDay()],
    })
  }

  const handleSave = () => {
    const finalPattern = { ...pattern }

    if (!showEndDate) {
      delete finalPattern.endDate
    }

    onSave(finalPattern)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Recurrence Pattern</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={pattern.frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pattern.frequency === "custom" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="interval">Every</Label>
                <Input
                  id="interval"
                  type="number"
                  min={1}
                  value={pattern.interval}
                  onChange={(e) =>
                    setPattern({
                      ...pattern,
                      interval: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={pattern.unit}
                  onValueChange={(value) =>
                    setPattern({
                      ...pattern,
                      unit: value as "day" | "week" | "month" | "year",
                    })
                  }
                >
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Days</SelectItem>
                    <SelectItem value="week">Weeks</SelectItem>
                    <SelectItem value="month">Months</SelectItem>
                    <SelectItem value="year">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {pattern.frequency === "weekly" && (
            <div className="grid gap-2">
              <Label>Days of Week</Label>
              <div className="flex flex-wrap gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${index}`}
                      checked={(pattern.daysOfWeek || []).includes(index)}
                      onCheckedChange={() => handleDayOfWeekToggle(index)}
                    />
                    <label
                      htmlFor={`day-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pattern.frequency === "monthly" && (
            <div className="grid gap-2">
              <Label htmlFor="dayOfMonth">Day of Month</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min={1}
                max={31}
                value={pattern.dayOfMonth || 1}
                onChange={(e) =>
                  setPattern({
                    ...pattern,
                    dayOfMonth: Number.parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          )}

          {pattern.frequency === "yearly" && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="monthOfYear">Month</Label>
                <Select
                  value={String(pattern.monthOfYear || 1)}
                  onValueChange={(value) =>
                    setPattern({
                      ...pattern,
                      monthOfYear: Number.parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="monthOfYear">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <SelectItem key={month} value={String(index + 1)}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dayOfMonth">Day</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min={1}
                  max={31}
                  value={pattern.dayOfMonth || 1}
                  onChange={(e) =>
                    setPattern({
                      ...pattern,
                      dayOfMonth: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="endDate" checked={showEndDate} onCheckedChange={(checked) => setShowEndDate(!!checked)} />
            <label htmlFor="endDate" className="text-sm font-medium leading-none">
              Set end date
            </label>
          </div>

          {showEndDate && (
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Calendar
                mode="single"
                selected={pattern.endDate}
                onSelect={(date) =>
                  setPattern({
                    ...pattern,
                    endDate: date,
                  })
                }
                initialFocus
                className="border rounded-md p-2"
              />
              {pattern.endDate && (
                <div className="text-sm text-muted-foreground">Ends on {format(pattern.endDate, "PPP")}</div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
