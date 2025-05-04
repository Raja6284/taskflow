import { render, screen, fireEvent } from "@testing-library/react"
import { TaskItem } from "@/components/task-item"
import type { Task } from "@/lib/types"

// Mock the RecurrenceDialog component
jest.mock("@/components/recurrence-dialog", () => ({
  RecurrenceDialog: () => <div data-testid="recurrence-dialog" />,
}))

describe("TaskItem Component", () => {
  const mockTask: Task = {
    id: "1",
    title: "Test Task",
    completed: false,
    createdAt: new Date(),
    dueDate: new Date(),
    recurrence: {
      frequency: "daily",
      interval: 1,
    },
  }

  const mockHandlers = {
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onUpdate: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders task title correctly", () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />)
    expect(screen.getByText("Test Task")).toBeInTheDocument()
  })

  test("calls onToggle when checkbox is clicked", () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />)
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(mockHandlers.onToggle).toHaveBeenCalledTimes(1)
  })

  test("enters edit mode when edit button is clicked", () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />)
    const editButton = screen.getByRole("button", { name: /edit/i })
    fireEvent.click(editButton)

    // Should now show an input with the task title
    const input = screen.getByDisplayValue("Test Task")
    expect(input).toBeInTheDocument()
  })

  test("updates task when editing is complete", () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />)

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i })
    fireEvent.click(editButton)

    // Change the input value
    const input = screen.getByDisplayValue("Test Task")
    fireEvent.change(input, { target: { value: "Updated Task" } })

    // Submit by pressing Enter
    fireEvent.keyDown(input, { key: "Enter" })

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith({ title: "Updated Task" })
  })

  test("calls onDelete when delete button is clicked", () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />)
    const deleteButton = screen.getByRole("button", { name: /delete/i })
    fireEvent.click(deleteButton)
    expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1)
  })

  test("applies line-through style when task is completed", () => {
    const completedTask = { ...mockTask, completed: true }
    render(<TaskItem task={completedTask} {...mockHandlers} />)

    const taskTitle = screen.getByText("Test Task")
    expect(taskTitle).toHaveClass("line-through")
  })
})
