"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Terminal, Play, Pause, Trash2, Download } from "lucide-react"

interface RealTimeEntry {
  type: "data" | "prediction"
  rowNumber?: number
  timestamp: string
  data: any
  predictions?: Array<{
    predictionNumber: number
    timestamp: string
    predicted_power: number
  }>
}

interface TerminalOutputProps {
  isActive?: boolean
}

export default function TerminalOutput({ isActive = false }: TerminalOutputProps) {
  const [entries, setEntries] = useState<RealTimeEntry[]>([])
  const [isStreaming, setIsStreaming] = useState(isActive)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const terminalRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [entries])

  // Fetch real-time data
  useEffect(() => {
    if (!isStreaming) return

    const fetchData = async () => {
      try {
        const response = await fetch("/api/realtime-stream", { cache: "no-store" })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setEntries((prev) => {
              // Add new entries and keep last 50 for performance
              const newEntries = [...prev, ...result.data].slice(-50)
              return newEntries
            })
            setLastUpdate(new Date())
          }
        }
      } catch (error) {
        console.error("Failed to fetch real-time data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [isStreaming])

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date
        .toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(/(\d+)\/(\d+)\/(\d+),/, "$3-$1-$2")
    } catch {
      return timestamp
    }
  }

  const clearTerminal = () => {
    setEntries([])
  }

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `solar-data-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Real-time Solar Monitoring Terminal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isStreaming ? "default" : "secondary"} className={isStreaming ? "bg-green-500" : ""}>
              {isStreaming ? "Live" : "Paused"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setIsStreaming(!isStreaming)}>
              {isStreaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={clearTerminal}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Last update: {lastUpdate.toLocaleTimeString()} | Entries: {entries.length}
        </p>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div
          ref={terminalRef}
          className="h-full bg-gray-900 text-green-400 font-mono text-sm p-4 overflow-y-auto"
          style={{ fontFamily: "Consolas, Monaco, 'Courier New', monospace" }}
        >
          {entries.length === 0 ? (
            <div className="text-gray-500">
              <p>🔄 Waiting for real-time data...</p>
              <p>Start the Python simulation to see live updates</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div key={index} className="mb-4">
                {entry.type === "data" && (
                  <div>
                    <div className="text-green-300 mb-1">
                      🟢 Row {entry.rowNumber} ➜ Time: {formatTimestamp(entry.timestamp)}
                    </div>
                    <div className="ml-4 space-y-1">
                      <div className="text-orange-400">🔸 Power(W): {entry.data.real_power}</div>
                      <div className="text-orange-400">🔸 Daily Prod(kWh): {entry.data.daily_prod?.toFixed(2)}</div>
                      <div className="text-orange-400">🔸 AC Current(A): {entry.data.ac_current?.toFixed(1)}</div>
                      <div className="text-orange-400">🔸 AC Voltage(V): {entry.data.ac_voltage?.toFixed(1)}</div>
                      <div className="text-orange-400">🔸 Inverter Temp(℃): {entry.data.temp_inverter?.toFixed(1)}</div>
                      <div className="text-orange-400">
                        🔸 Cumulative Prod(kWh): {entry.data.cumulative_prod?.toFixed(1)}
                      </div>
                      <div className="text-orange-400">🔸 AC Frequency(Hz): {entry.data.ac_freq?.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                {entry.type === "prediction" && entry.predictions && (
                  <div>
                    {entry.predictions.map((pred) => (
                      <div key={pred.predictionNumber} className="mb-2">
                        <div className="text-purple-400 mb-1">
                          📈 Prediction {pred.predictionNumber} ➜ {formatTimestamp(pred.timestamp)}
                        </div>
                        <div className="ml-4">
                          <div className="text-purple-300">🔮 Predicted Power: {pred.predicted_power.toFixed(2)} W</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
