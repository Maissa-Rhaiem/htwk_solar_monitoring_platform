import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface DashboardData {
  timestamp: string
  real_power: number
  daily_prod: number
  ac_current: number
  ac_voltage: number
  temp_inverter: number
  cumulative_prod: number
  ac_freq: number
  predictions: Array<{
    timestamp: string
    predicted_power: number
    method?: string
    confidence?: number
  }>
  status: string
  last_update: string
  model_accuracy: number
  predictions_today: number
}

// Helper function to read status file
function getSystemStatus(): any {
  const statusPath = path.join(process.cwd(), "data", "status.json")

  try {
    if (!fs.existsSync(statusPath)) {
      return {
        status: "demo",
        model_accuracy: 0,
        predictions_today: 0,
        last_update: new Date().toISOString(),
      }
    }

    const data = fs.readFileSync(statusPath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading status file:", error)
    return {
      status: "demo",
      model_accuracy: 0,
      predictions_today: 0,
      last_update: new Date().toISOString(),
    }
  }
}

// Helper function to get latest data from terminal log
function getLatestDataFromTerminalLog(): any {
  const terminalLogPath = path.join(process.cwd(), "data", "terminal_log.json")

  try {
    if (!fs.existsSync(terminalLogPath)) {
      return null
    }

    const data = fs.readFileSync(terminalLogPath, "utf-8")
    const logs = JSON.parse(data)

    // Find the latest data entry
    const dataEntries = logs.filter((log: any) => log.type === "data")
    if (dataEntries.length === 0) return null

    const latestEntry = dataEntries[dataEntries.length - 1]
    return latestEntry.data
  } catch (error) {
    console.error("Error reading terminal log:", error)
    return null
  }
}

// Helper function to get recent predictions
function getRecentPredictions(): Array<{
  timestamp: string
  predicted_power: number
  method?: string
  confidence?: number
}> {
  const terminalLogPath = path.join(process.cwd(), "data", "terminal_log.json")

  try {
    if (!fs.existsSync(terminalLogPath)) {
      return []
    }

    const data = fs.readFileSync(terminalLogPath, "utf-8")
    const logs = JSON.parse(data)

    // Find the latest prediction entry
    const predictionEntries = logs.filter((log: any) => log.type === "prediction")
    if (predictionEntries.length === 0) return []

    const latestPrediction = predictionEntries[predictionEntries.length - 1]
    return latestPrediction.data.predictions.map((pred: any) => ({
      timestamp: pred.timestamp,
      predicted_power: pred.predicted_power,
      method: pred.method || "Unknown",
      confidence: pred.confidence || 0,
    }))
  } catch (error) {
    console.error("Error reading predictions from terminal log:", error)
    return []
  }
}

export async function GET() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Get system status
    const systemStatus = getSystemStatus()

    // Get latest real data
    const latestData = getLatestDataFromTerminalLog()

    // Get recent predictions
    const predictions = getRecentPredictions()

    // Build dashboard data
    const dashboardData: DashboardData = latestData
      ? {
          timestamp: latestData.timestamp,
          real_power: latestData.real_power,
          daily_prod: latestData.daily_prod,
          ac_current: latestData.ac_current,
          ac_voltage: latestData.ac_voltage,
          temp_inverter: latestData.temp_inverter,
          cumulative_prod: latestData.cumulative_prod,
          ac_freq: latestData.ac_freq,
          predictions,
          status: systemStatus.status,
          last_update: systemStatus.last_update,
          model_accuracy: systemStatus.model_accuracy || 0,
          predictions_today: systemStatus.predictions_today || 0,
        }
      : {
          // Demo data when no real data is available
          timestamp: new Date().toISOString(),
          real_power: 160,
          daily_prod: 2.5,
          ac_current: 2.8,
          ac_voltage: 230.0,
          temp_inverter: 46.0,
          cumulative_prod: 4750.0,
          ac_freq: 50.01,
          predictions: [],
          status: "demo",
          last_update: new Date().toISOString(),
          model_accuracy: 0,
          predictions_today: 0,
        }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error in dashboard-data API:", error)

    // Return demo data on error
    const demoData: DashboardData = {
      timestamp: new Date().toISOString(),
      real_power: 160,
      daily_prod: 2.5,
      ac_current: 2.8,
      ac_voltage: 230.0,
      temp_inverter: 46.0,
      cumulative_prod: 4750.0,
      ac_freq: 50.01,
      predictions: [],
      status: "demo",
      last_update: new Date().toISOString(),
      model_accuracy: 0,
      predictions_today: 0,
    }

    return NextResponse.json(demoData)
  }
}
