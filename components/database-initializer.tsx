"use client"

import { useEffect, useState, useRef } from "react"
import { setupDatabase } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function DatabaseInitializer() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initialized.current) return
    initialized.current = true

    const initDb = async () => {
      try {
        await setupDatabase()
        setStatus("success")
      } catch (err) {
        console.error("Failed to initialize database:", err)
        // Don't set error status immediately, give it a chance to retry
        setTimeout(() => {
          if (status === "loading") {
            setStatus("error")
            setError(err instanceof Error ? err.message : "Unknown error")
          }
        }, 5000)
      }
    }

    initDb()
  }, [status])

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing database...</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>Failed to initialize database: {error || "Unknown error"}</AlertDescription>
      </Alert>
    )
  }

  return null
}
