import { NextResponse } from "next/server"

// This would need to be shared across requests in a real app
// For demo purposes, we'll use a simple approach
let pythonProcess: any = null

export async function POST() {
  try {
    if (pythonProcess && !pythonProcess.killed) {
      pythonProcess.kill("SIGTERM")
      pythonProcess = null

      return NextResponse.json({
        success: true,
        message: "Simulation stopped successfully",
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "No simulation is currently running",
      })
    }
  } catch (error) {
    console.error("Error stopping Python simulation:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to stop simulation",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
