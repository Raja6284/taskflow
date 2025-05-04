"use client"

import { useEffect, useRef } from "react"
import { useTaskStore } from "@/lib/store"
import { fetchTasks, createTask, updateTask, deleteTask, setupDatabase } from "@/lib/api"
import type { Task } from "@/lib/types"

export function TaskSync() {
  // Use a ref to track initialization state
  const initialized = useRef(false)
  const syncInProgress = useRef(false)

  const {
    tasks,
    addTask: addTaskToStore,
    toggleTask: toggleTaskInStore,
    deleteTask: deleteTaskFromStore,
    updateTask: updateTaskInStore,
    generateRecurringInstances,
    setTasks,
  } = useTaskStore()

  // Initialize database and fetch tasks on first load - ONCE ONLY
  useEffect(() => {
    if (initialized.current) return

    const initializeApp = async () => {
      try {
        // Set up the database tables
        await setupDatabase()

        // Fetch tasks from the API
        const fetchedTasks = await fetchTasks()

        // Set all tasks at once instead of adding them one by one
        setTasks(fetchedTasks)

        // Mark as initialized
        initialized.current = true
      } catch (error) {
        console.error("Failed to initialize app:", error)
      }
    }

    initializeApp()

    // Set up interval to check for recurring tasks - with cleanup
    const intervalId = setInterval(() => {
      generateRecurringInstances()
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [setTasks, generateRecurringInstances])

  // Sync task changes with the API - with safeguards against multiple calls
  const addTask = async (task: Task) => {
    if (syncInProgress.current) return
    syncInProgress.current = true

    try {
      await createTask(task)
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      syncInProgress.current = false
    }
  }

  const toggleTask = async (id: string) => {
    if (syncInProgress.current) return
    syncInProgress.current = true

    try {
      const task = tasks.find((t) => t.id === id)
      if (task) {
        await updateTask(id, { completed: !task.completed })

        // If the task is now completed and has a recurrence pattern,
        // generate the next occurrence
        if (!task.completed && task.recurrence) {
          generateRecurringInstances()
        }
      }
    } catch (error) {
      console.error("Failed to toggle task:", error)
    } finally {
      syncInProgress.current = false
    }
  }

  const updateTaskHandler = async (id: string, updatedTask: Partial<Task>) => {
    if (syncInProgress.current) return
    syncInProgress.current = true

    try {
      await updateTask(id, updatedTask)
    } catch (error) {
      console.error("Failed to update task:", error)
    } finally {
      syncInProgress.current = false
    }
  }

  const deleteTaskHandler = async (id: string) => {
    if (syncInProgress.current) return
    syncInProgress.current = true

    try {
      await deleteTask(id)
    } catch (error) {
      console.error("Failed to delete task:", error)
    } finally {
      syncInProgress.current = false
    }
  }

  // Override store methods to sync with API - ONCE ONLY
  useEffect(() => {
    // Skip if already initialized
    if (initialized.current) return

    const originalAddTask = useTaskStore.getState().addTask
    const originalToggleTask = useTaskStore.getState().toggleTask
    const originalUpdateTask = useTaskStore.getState().updateTask
    const originalDeleteTask = useTaskStore.getState().deleteTask

    useTaskStore.setState({
      addTask: (task) => {
        originalAddTask(task)
        addTask(task)
      },
      toggleTask: (id) => {
        originalToggleTask(id)
        toggleTask(id)
      },
      updateTask: (id, task) => {
        originalUpdateTask(id, task)
        updateTaskHandler(id, task)
      },
      deleteTask: (id) => {
        originalDeleteTask(id)
        deleteTaskHandler(id)
      },
    })

    // No cleanup function needed as we only want to set this once
  }, [])

  return null // This component doesn't render anything
}
