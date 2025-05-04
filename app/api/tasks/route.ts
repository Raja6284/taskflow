import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { z } from "zod"

// Task schema for validation
const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
  createdAt: z.date().optional(),
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

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM tasks 
      ORDER BY 
        CASE WHEN completed = true THEN 1 ELSE 0 END,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
        due_date ASC,
        created_at DESC
    `

    // Parse dates and JSON fields
    const tasks = rows.map((row) => ({
      id: row.id,
      title: row.title,
      completed: row.completed,
      createdAt: new Date(row.created_at),
      dueDate: row.due_date ? new Date(row.due_date) : null,
      recurrence: row.recurrence ? JSON.parse(row.recurrence) : null,
    }))

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = TaskSchema.parse(body)

    // Generate a unique ID if not provided
    const id = validatedData.id || crypto.randomUUID()
    const createdAt = validatedData.createdAt || new Date()

    // Insert the task into the database
    await sql`
      INSERT INTO tasks (
        id, 
        title, 
        completed, 
        created_at, 
        due_date, 
        recurrence
      ) VALUES (
        ${id}, 
        ${validatedData.title}, 
        ${validatedData.completed}, 
        ${createdAt.toISOString()}, 
        ${validatedData.dueDate ? validatedData.dueDate.toISOString() : null}, 
        ${validatedData.recurrence ? JSON.stringify(validatedData.recurrence) : null}
      )
    `

    return NextResponse.json(
      {
        id,
        title: validatedData.title,
        completed: validatedData.completed,
        createdAt,
        dueDate: validatedData.dueDate,
        recurrence: validatedData.recurrence,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating task:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid task data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
