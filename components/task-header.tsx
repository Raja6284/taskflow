"use client"

import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface TaskHeaderProps {
  totalTasks: number
  completedTasks: number
  showCompleted: boolean
  setShowCompleted: (show: boolean) => void
}

export function TaskHeader({ totalTasks, completedTasks, showCompleted, setShowCompleted }: TaskHeaderProps) {
  // Add client-side state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  // Only show the actual counts after component has mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">TaskFlow</h1>
        <ModeToggle />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {mounted ? `${completedTasks} of ${totalTasks} tasks completed` : "Loading..."}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCompleted(!showCompleted)}>
          {showCompleted ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Completed
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Completed
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
