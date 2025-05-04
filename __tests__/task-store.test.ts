import { useTaskStore } from "@/lib/store"
import { act } from "@testing-library/react"
import { jest } from "@jest/globals"

// Reset the store before each test
beforeEach(() => {
  useTaskStore.setState({
    tasks: [],
    addTask: useTaskStore.getState().addTask,
    toggleTask: useTaskStore.getState().toggleTask,
    deleteTask: useTaskStore.getState().deleteTask,
    updateTask: useTaskStore.getState().updateTask,
    generateRecurringInstances: useTaskStore.getState().generateRecurringInstances,
  })
})

describe("Task Store", () => {
  test("should add a task", () => {
    const task = {
      id: "1",
      title: "Test Task",
      completed: false,
      createdAt: new Date(),
    }

    act(() => {
      useTaskStore.getState().addTask(task)
    })

    expect(useTaskStore.getState().tasks).toHaveLength(1)
    expect(useTaskStore.getState().tasks[0]).toEqual(task)
  })

  test("should toggle a task", () => {
    const task = {
      id: "1",
      title: "Test Task",
      completed: false,
      createdAt: new Date(),
    }

    act(() => {
      useTaskStore.getState().addTask(task)
      useTaskStore.getState().toggleTask("1")
    })

    expect(useTaskStore.getState().tasks[0].completed).toBe(true)

    act(() => {
      useTaskStore.getState().toggleTask("1")
    })

    expect(useTaskStore.getState().tasks[0].completed).toBe(false)
  })

  test("should delete a task", () => {
    const task1 = {
      id: "1",
      title: "Test Task 1",
      completed: false,
      createdAt: new Date(),
    }

    const task2 = {
      id: "2",
      title: "Test Task 2",
      completed: false,
      createdAt: new Date(),
    }

    act(() => {
      useTaskStore.getState().addTask(task1)
      useTaskStore.getState().addTask(task2)
    })

    expect(useTaskStore.getState().tasks).toHaveLength(2)

    act(() => {
      useTaskStore.getState().deleteTask("1")
    })

    expect(useTaskStore.getState().tasks).toHaveLength(1)
    expect(useTaskStore.getState().tasks[0].id).toBe("2")
  })

  test("should update a task", () => {
    const task = {
      id: "1",
      title: "Test Task",
      completed: false,
      createdAt: new Date(),
    }

    act(() => {
      useTaskStore.getState().addTask(task)
      useTaskStore.getState().updateTask("1", { title: "Updated Task" })
    })

    expect(useTaskStore.getState().tasks[0].title).toBe("Updated Task")
  })

  test("should generate recurring instances for completed tasks", () => {
    // Mock Date.now to return a consistent value
    const originalDateNow = Date.now
    Date.now = jest.fn(() => 1620000000000) // May 3, 2021

    const today = new Date(Date.now())

    const task = {
      id: "1",
      title: "Recurring Task",
      completed: true,
      createdAt: today,
      dueDate: today,
      recurrence: {
        frequency: "daily",
        interval: 1,
      },
    }

    act(() => {
      useTaskStore.getState().addTask(task)
      useTaskStore.getState().generateRecurringInstances()
    })

    // Should have the original task plus a new recurring instance
    expect(useTaskStore.getState().tasks).toHaveLength(2)

    // The new task should have tomorrow's date
    const newTask = useTaskStore.getState().tasks[1]
    expect(newTask.title).toBe("Recurring Task")
    expect(newTask.completed).toBe(false)

    // Restore the original Date.now
    Date.now = originalDateNow
  })
})
