"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Square, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

interface SimulationControlProps {
  onStatusChange?: (status: string) => void
}

export default function SimulationControl({ onStatusChange }: SimulationControlProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const startSimulation = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/start-simulation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        setIsRunning(true)
        setMessage("Simulation started successfully!")
        onStatusChange?.("active")
      } else {
        setMessage(result.message || "Failed to start simulation")
      }
    } catch (error) {
      setMessage("Error starting simulation")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const stopSimulation = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/stop-simulation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        setIsRunning(false)
        setMessage("Simulation stopped successfully")
        onStatusChange?.("demo")
      } else {
        setMessage(result.message || "Failed to stop simulation")
      }
    } catch (error) {
      setMessage("Error stopping simulation")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <RefreshCw className="h-6 w-6" />
          Simulation Control
        </CardTitle>
        <CardDescription className="text-lg">Start or stop the real-time monitoring simulation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-6">
          <Button
            onClick={startSimulation}
            disabled={isRunning || isLoading}
            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
            size="lg"
          >
            {isLoading ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <Play className="h-5 w-5 mr-2" />}
            Start Simulation
          </Button>

          <Button
            onClick={stopSimulation}
            disabled={!isRunning || isLoading}
            variant="destructive"
            className="text-lg px-8 py-3"
            size="lg"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop Simulation
          </Button>
        </div>

        <div className="flex justify-center">
          <Badge
            variant={isRunning ? "default" : "secondary"}
            className={`text-lg px-4 py-2 ${isRunning ? "bg-green-500" : ""}`}
          >
            {isRunning ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
            {isRunning ? "Running" : "Stopped"}
          </Badge>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-center ${
              message.includes("success") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            <p className="text-base">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

