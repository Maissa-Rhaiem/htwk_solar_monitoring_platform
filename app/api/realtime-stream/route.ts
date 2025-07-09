import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

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

// Helper function to read terminal log (contains your REAL Excel data)
function getLatestRealTimeData(): RealTimeEntry[] {
  const entries: RealTimeEntry[] = []
  const terminalLogPath = path.join(process.cwd(), "data", "terminal_log.json")

  try {
    if (!fs.existsSync(terminalLogPath)) {
      return []
    }

    const data = fs.readFileSync(terminalLogPath, "utf-8")
    const logs = JSON.parse(data)

    // Get recent entries (last 10)
    const recentLogs = logs.slice(-10)

    recentLogs.forEach((log: any) => {
      if (log.type === "data") {
        entries.push({
          type: "data",
          rowNumber: log.data.rowNumber,
          timestamp: log.data.timestamp,
          data: {
            timestamp: log.data.timestamp,
            real_power: log.data.real_power,
            daily_prod: log.data.daily_prod,
            ac_current: log.data.ac_current,
            ac_voltage: log.data.ac_voltage,
            temp_inverter: log.data.temp_inverter,
            cumulative_prod: log.data.cumulative_prod,
            ac_freq: log.data.ac_freq,
          },
        })
      } else if (log.type === "prediction") {
        entries.push({
          type: "prediction",
          timestamp: log.timestamp,
          data: null,
          predictions: log.data.predictions,
        })
      }
    })
  } catch (error) {
    console.error("Error reading terminal log:", error)
  }

  return entries
}

export async function GET() {
  try {
    const realtimeData = getLatestRealTimeData()

    return NextResponse.json({
      success: true,
      data: realtimeData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in realtime-stream API:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch real-time data",
      data: [],
    })
  }
}
