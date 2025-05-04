const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
const bodyParser = require("body-parser")
require("dotenv").config()

// Create Express app
const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(bodyParser.json())

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to database:", err)
  } else {
    console.log("Connected to PostgreSQL database")
    release()
  }
})

// API Routes
// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tasks 
      ORDER BY 
        CASE WHEN completed = true THEN 1 ELSE 0 END,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
        due_date ASC,
        created_at DESC
    `)

    const tasks = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      completed: row.completed,
      createdAt: row.created_at,
      dueDate: row.due_date,
      recurrence: row.recurrence,
    }))

    res.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({ error: "Failed to fetch tasks" })
  }
})

// Get a single task
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    const row = result.rows[0]
    res.json({
      id: row.id,
      title: row.title,
      completed: row.completed,
      createdAt: row.created_at,
      dueDate: row.due_date,
      recurrence: row.recurrence,
    })
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({ error: "Failed to fetch task" })
  }
})

// Create a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, completed = false, createdAt, dueDate, recurrence } = req.body

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" })
    }

    const id = req.body.id || crypto.randomUUID()
    const created = createdAt || new Date()

    const result = await pool.query(
      `INSERT INTO tasks (id, title, completed, created_at, due_date, recurrence) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [id, title, completed, created, dueDate, recurrence ? JSON.stringify(recurrence) : null],
    )

    const row = result.rows[0]
    res.status(201).json({
      id: row.id,
      title: row.title,
      completed: row.completed,
      createdAt: row.created_at,
      dueDate: row.due_date,
      recurrence: row.recurrence,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({ error: "Failed to create task" })
  }
})

// Update a task
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { title, completed, dueDate, recurrence } = req.body

    // Check if the task exists
    const checkResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Build the update query dynamically
    const updates = []
    const values = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      values.push(title)
      paramCount++
    }

    if (completed !== undefined) {
      updates.push(`completed = $${paramCount}`)
      values.push(completed)
      paramCount++
    }

    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount}`)
      values.push(dueDate)
      paramCount++
    }

    if (recurrence !== undefined) {
      updates.push(`recurrence = $${paramCount}`)
      values.push(recurrence ? JSON.stringify(recurrence) : null)
      paramCount++
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" })
    }

    values.push(id)
    const updateQuery = `
      UPDATE tasks 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCount} 
      RETURNING *
    `

    const result = await pool.query(updateQuery, values)
    const row = result.rows[0]

    res.json({
      id: row.id,
      title: row.title,
      completed: row.completed,
      createdAt: row.created_at,
      dueDate: row.due_date,
      recurrence: row.recurrence,
    })
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ error: "Failed to update task" })
  }
})

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Check if the task exists
    const checkResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id])
    res.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ error: "Failed to delete task" })
  }
})

// Setup database endpoint
app.get("/api/setup", async (req, res) => {
  try {
    // Create the tasks table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP WITH TIME ZONE,
        recurrence JSONB
      )
    `)

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks (completed)
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date)
    `)

    res.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error) {
    console.error("Database setup error:", error)
    res.status(500).json({ error: "Failed to set up database" })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Express server running on port ${port}`)
})

module.exports = app
