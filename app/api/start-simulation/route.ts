import { NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"

let pythonProcess: any = null

export async function POST() {
  try {
    // Check if process is already running
    if (pythonProcess && !pythonProcess.killed) {
      return NextResponse.json({
        success: false,
        message: "Simulation is already running",
      })
    }

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Path to your Python script
    const pythonScriptPath = path.join(process.cwd(), "python", "solar_monitoring.py")

    // Start Python process
    pythonProcess = spawn("python", [pythonScriptPath], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    })

    // Handle Python process output
    pythonProcess.stdout.on("data", (data: Buffer) => {
      console.log(`Python stdout: ${data.toString()}`)
    })

    pythonProcess.stderr.on("data", (data: Buffer) => {
      console.error(`Python stderr: ${data.toString()}`)
    })

    pythonProcess.on("close", (code: number) => {
      console.log(`Python process exited with code ${code}`)
      pythonProcess = null
    })

    return NextResponse.json({
      success: true,
      message: "Solar monitoring simulation started successfully",
    })
  } catch (error) {
    console.error("Error starting Python simulation:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to start simulation",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
