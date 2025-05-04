import type { Task } from "@/lib/types"

// Update the API_BASE_URL to use the environment variable if available
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Add a debounce mechanism to prevent rapid successive calls
let lastApiCallTime = 0
const API_CALL_DELAY = 300 // ms

function shouldProceedWithApiCall() {
  const now = Date.now()
  if (now - lastApiCallTime < API_CALL_DELAY) {
    return false
  }
  lastApiCallTime = now
  return true
}

export async function fetchTasks(): Promise<Task[]> {
  if (!shouldProceedWithApiCall()) {
    console.log("Throttling API call to fetchTasks")
    return []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tasks`)

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Convert date strings to Date objects
    return data.tasks.map((task: any) => ({
      ...task,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      recurrence: task.recurrence
        ? {
            ...task.recurrence,
            endDate: task.recurrence.endDate ? new Date(task.recurrence.endDate) : undefined,
          }
        : null,
    }))
  } catch (error) {
    console.error("API Error in fetchTasks:", error)
    return []
  }
}

export async function createTask(task: Omit<Task, "id">): Promise<Task> {
  if (!shouldProceedWithApiCall()) {
    console.log("Throttling API call to createTask")
    throw new Error("Too many requests")
  }

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    ...data,
    createdAt: new Date(data.createdAt),
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    recurrence: task.recurrence
      ? {
          ...data.recurrence,
          endDate: task.recurrence.endDate ? new Date(data.recurrence.endDate) : undefined,
        }
      : null,
  }
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  if (!shouldProceedWithApiCall()) {
    console.log("Throttling API call to updateTask")
    throw new Error("Too many requests")
  }

  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    ...data,
    createdAt: new Date(data.createdAt),
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    recurrence: task.recurrence
      ? {
          ...data.recurrence,
          endDate: task.recurrence.endDate ? new Date(data.recurrence.endDate) : undefined,
        }
      : null,
  }
}

export async function deleteTask(id: string): Promise<void> {
  if (!shouldProceedWithApiCall()) {
    console.log("Throttling API call to deleteTask")
    throw new Error("Too many requests")
  }

  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.status} ${response.statusText}`)
  }
}

// Add a flag to track if setup has been called
let setupComplete = false

export async function setupDatabase(): Promise<void> {
  if (setupComplete) {
    console.log("Database setup already completed")
    return
  }

  const response = await fetch(`${API_BASE_URL}/setup`)

  if (!response.ok) {
    throw new Error(`Failed to set up database: ${response.status} ${response.statusText}`)
  }

  setupComplete = true
}
