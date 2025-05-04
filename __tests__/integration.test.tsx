import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { TaskDashboard } from "@/components/task-dashboard"
import { useTaskStore } from "@/lib/store"

// Mock the API calls
jest.mock("@/lib/api", () => ({
  fetchTasks: jest.fn(() => Promise.resolve([])),
  createTask: jest.fn((task) => Promise.resolve(task)),
  updateTask: jest.fn((id, task) => Promise.resolve({ id, ...task })),
  deleteTask: jest.fn(() => Promise.resolve()),
  setupDatabase: jest.fn(() => Promise.resolve()),
}))

describe("Integration Test - Task Flow", () => {
  beforeEach(() => {
    // Reset the store
    useTaskStore.setState({
      tasks: [],
      addTask: useTaskStore.getState().addTask,
      toggleTask: useTaskStore.getState().toggleTask,
      deleteTask: useTaskStore.getState().deleteTask,
      updateTask: useTaskStore.getState().updateTask,
      generateRecurringInstances: useTaskStore.getState().generateRecurringInstances,
    })
  })

  test("full task lifecycle: create, update, complete, delete", async () => {
    render(<TaskDashboard />)

    // 1. Create a new task
    const input = screen.getByPlaceholderText("Add a new task...")
    fireEvent.change(input, { target: { value: "New integration test task" } })

    const addButton = screen.getByRole("button", { name: /add task/i })
    fireEvent.click(addButton)

    // Verify task was added
    await waitFor(() => {
      expect(screen.getByText("New integration test task")).toBeInTheDocument()
    })

    // 2. Edit the task
    const editButton = screen.getByRole("button", { name: /edit/i })
    fireEvent.click(editButton)

    const editInput = screen.getByDisplayValue("New integration test task")
    fireEvent.change(editInput, { target: { value: "Updated integration test task" } })
    fireEvent.keyDown(editInput, { key: "Enter" })

    // Verify task was updated
    await waitFor(() => {
      expect(screen.getByText("Updated integration test task")).toBeInTheDocument()
    })

    // 3. Complete the task
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)

    // Verify task is marked as completed (has line-through style)
    await waitFor(() => {
      const taskText = screen.getByText("Updated integration test task")
      expect(taskText).toHaveClass("line-through")
    })

    // 4. Delete the task
    const deleteButton = screen.getByRole("button", { name: /delete/i })
    fireEvent.click(deleteButton)

    // Verify task was removed
    await waitFor(() => {
      expect(screen.queryByText("Updated integration test task")).not.toBeInTheDocument()
    })
  })

  test("recurrence flow: create recurring task and verify UI elements", async () => {
    render(<TaskDashboard />)

    // 1. Create a new task
    const input = screen.getByPlaceholderText("Add a new task...")
    fireEvent.change(input, { target: { value: "Recurring test task" } })

    // 2. Set recurrence
    const recurrenceButton = screen.getByText("Set recurrence")
    fireEvent.click(recurrenceButton)

    // Verify recurrence dialog appears
    await waitFor(() => {
      expect(screen.getByText("Set Recurrence Pattern")).toBeInTheDocument()
    })

    // Select daily frequency
    const frequencySelect = screen.getByRole("combobox", { name: /frequency/i })
    fireEvent.click(frequencySelect)
    const dailyOption = screen.getByText("Daily")
    fireEvent.click(dailyOption)

    // Save the recurrence pattern
    const saveButton = screen.getByRole("button", { name: /save/i })
    fireEvent.click(saveButton)

    // Verify recurrence is set
    await waitFor(() => {
      expect(screen.getByText("Repeats: Daily")).toBeInTheDocument()
    })

    // Add the task
    const addButton = screen.getByRole("button", { name: /add task/i })
    fireEvent.click(addButton)

    // Verify task was added with recurrence info
    await waitFor(() => {
      expect(screen.getByText("Recurring test task")).toBeInTheDocument()
      expect(screen.getByText("Repeats: Daily")).toBeInTheDocument()
    })
  })
})
