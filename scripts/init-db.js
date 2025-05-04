const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function initializeDatabase() {
  try {
    console.log("Connecting to PostgreSQL database...")

    // Create tasks table
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

    console.log("Database initialization completed successfully!")

    // Insert sample tasks if needed
    const { rows } = await pool.query("SELECT COUNT(*) FROM tasks")
    if (Number.parseInt(rows[0].count) === 0) {
      console.log("Adding sample tasks...")

      const sampleTasks = [
        {
          id: "1",
          title: "Complete project documentation",
          completed: false,
          created_at: new Date(),
          due_date: new Date(Date.now() + 86400000), // Tomorrow
          recurrence: JSON.stringify({
            frequency: "weekly",
            interval: 1,
            daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
          }),
        },
        {
          id: "2",
          title: "Review code changes",
          completed: false,
          created_at: new Date(),
          due_date: new Date(Date.now() + 172800000), // Day after tomorrow
          recurrence: null,
        },
        {
          id: "3",
          title: "Team meeting",
          completed: false,
          created_at: new Date(),
          due_date: new Date(Date.now() + 259200000), // 3 days from now
          recurrence: JSON.stringify({
            frequency: "daily",
            interval: 1,
          }),
        },
      ]

      for (const task of sampleTasks) {
        await pool.query(
          `INSERT INTO tasks (id, title, completed, created_at, due_date, recurrence) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [task.id, task.title, task.completed, task.created_at, task.due_date, task.recurrence],
        )
      }

      console.log("Sample tasks added successfully!")
    }
  } catch (error) {
    //console.error("Database initialization error:", error)
  } finally {
    await pool.end()
    console.log("Database connection closed")
  }
}

initializeDatabase()
