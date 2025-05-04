"use client"

import { useState, useEffect } from "react"
import { TaskHeader } from "@/components/task-header"
import { TaskList } from "@/components/task-list"
import { TaskInput } from "@/components/task-input"
import { useTaskStore } from "@/lib/store"
import { TaskSync } from "@/components/task-sync"

export function TaskDashboard() {
  const [showCompleted, setShowCompleted] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const tasks = useTaskStore((state) => state.tasks)

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only calculate these on the client to avoid hydration mismatch
  const completedTasks = isClient ? tasks.filter((task) => task.completed) : []
  const incompleteTasks = isClient ? tasks.filter((task) => !task.completed) : []
  const displayTasks = isClient ? (showCompleted ? tasks : incompleteTasks) : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <TaskSync />
      <TaskHeader
        totalTasks={isClient ? tasks.length : 0}
        completedTasks={isClient ? completedTasks.length : 0}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
      />
      <TaskInput />
      {isClient && <TaskList tasks={displayTasks} />}
    </div>
  )
}
