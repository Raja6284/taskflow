"use client"

import type { Task } from "@/lib/types"
import { TaskItem } from "@/components/task-item"
import { useTaskStore } from "@/lib/store"

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const updateTask = useTaskStore((state) => state.updateTask)

  if (tasks.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No tasks to display</div>
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => toggleTask(task.id)}
          onDelete={() => deleteTask(task.id)}
          onUpdate={(updatedTask) => updateTask(task.id, updatedTask)}
        />
      ))}
    </div>
  )
}
