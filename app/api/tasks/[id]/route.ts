import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { z } from "zod"

// Task update schema for validation
const TaskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  dueDate: z.date().optional().nullable(),
  recurrence: z
    .object({
      frequency: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]),
      interval: z.number().int().positive(),
      unit: z.enum(["day", "week", "month", "year"]).optional(),
      daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
      dayOfMonth: z.number().int().min(1).max(31).optional(),
      monthOfYear: z.number().int().min(1).max(12).optional(),
      endDate: z.date().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { rows } = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const row = rows[0]

    return NextResponse.json({
      id: row.id,
      title: row.title,
      completed: row.completed,
      createdAt: new Date(row.created_at),
      dueDate: row.due_date ? new Date(row.due_date) : null,
      recurrence: row.recurrence ? JSON.parse(row.recurrence) : null,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate the request body
    const validatedData = TaskUpdateSchema.parse(body)

    // Check if the task exists
    const { rows } = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Build the update query dynamically based on provided fields
    let updateQuery = "UPDATE tasks SET "
    const updateValues = []
    const updateFields = []

    if (validatedData.title !== undefined) {
      updateFields.push("title = $" + (updateValues.length + 1))
      updateValues.push(validatedData.title)
    }

    if (validatedData.completed !== undefined) {
      updateFields.push("completed = $" + (updateValues.length + 1))
      updateValues.push(validatedData.completed)
    }

    if ("dueDate" in validatedData) {
      updateFields.push("due_date = $" + (updateValues.length + 1))
      updateValues.push(validatedData.dueDate ? validatedData.dueDate.toISOString() : null)
    }

    if ("recurrence" in validatedData) {
      updateFields.push("recurrence = $" + (updateValues.length + 1))
      updateValues.push(validatedData.recurrence ? JSON.stringify(validatedData.recurrence) : null)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    updateQuery += updateFields.join(", ") + " WHERE id = $" + (updateValues.length + 1)
    updateValues.push(id)

    // Execute the update
    await sql.query(updateQuery, updateValues)

    // Fetch the updated task
    const { rows: updatedRows } = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `

    const updatedTask = {
      id: updatedRows[0].id,
      title: updatedRows[0].title,
      completed: updatedRows[0].completed,
      createdAt: new Date(updatedRows[0].created_at),
      dueDate: updatedRows[0].due_date ? new Date(updatedRows[0].due_date) : null,
      recurrence: updatedRows[0].recurrence ? JSON.parse(updatedRows[0].recurrence) : null,
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid task data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if the task exists
    const { rows } = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Delete the task
    await sql`
      DELETE FROM tasks WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
