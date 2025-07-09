"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Zap,
  Thermometer,
  Gauge,
  Battery,
  Sun,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Shield,
  Radio,
  TrendingUp,
  Database,
  Wifi,
} from "lucide-react"
import { useRouter } from "next/navigation"

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
  }>
  status: string
  last_update: string
}

export default function RealTimePage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)

  // Check authentication on page load
  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    const userInfo = localStorage.getItem("user")

    if (!authToken || !userInfo) {
      router.push("/")
      return
    }

    try {
      const user = JSON.parse(userInfo)
      if (user.authenticated) {
        setIsAuthenticated(true)
      } else {
        router.push("/")
      }
    } catch (error) {
      router.push("/")
    }
  }, [router])

  // Load real-time data from your API
  useEffect(() => {
    if (!isAuthenticated) return

    const loadRealTimeData = async () => {
      try {
        const res = await fetch("/api/dashboard-data", { cache: "no-store" })
        const isJson = res.headers.get("content-type")?.toLowerCase().includes("application/json")

        if (!res.ok || !isJson) throw new Error("Non-JSON response")

        const data = (await res.json()) as DashboardData
        setDashboardData(data)
        setIsConnected(data.status === "active")
        setLastUpdate(new Date())
        setUpdateCount((prev) => prev + 1)
      } catch (err) {
        console.error("Failed to load real-time data:", err)
        setIsConnected(false)
        // Keep existing data or set demo data
        if (!dashboardData) {
          setDashboardData({
            timestamp: new Date().toISOString(),
            real_power: 0,
            daily_prod: 0,
            ac_current: 0,
            ac_voltage: 0,
            temp_inverter: 0,
            cumulative_prod: 0,
            ac_freq: 0,
            predictions: [],
            status: "demo",
            last_update: new Date().toISOString(),
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadRealTimeData()
    const interval = setInterval(loadRealTimeData, 2000) // Update every 2 seconds for real-time feel
    return () => clearInterval(interval)
  }, [isAuthenticated, dashboardData])

  const getStatusColor = (value: number, min: number, max: number, optimal?: { min: number; max: number }) => {
    if (value === 0) return "text-gray-400"
    if (optimal) {
      if (value >= optimal.min && value <= optimal.max) return "text-green-500"
      if (value < min || value > max) return "text-red-500"
      return "text-yellow-500"
    }
    if (value < min || value > max) return "text-red-500"
    if (value < min * 1.1 || value > max * 0.9) return "text-yellow-500"
    return "text-green-500"
  }

  const getProgressValue = (value: number, max: number) => {
    return Math.min(100, (value / max) * 100)
  }

  const calculateEfficiency = () => {
    if (!dashboardData || dashboardData.real_power === 0 || dashboardData.ac_voltage === 0) return 0
    // Simple efficiency calculation based on power output vs theoretical maximum
    const theoreticalMax = dashboardData.ac_voltage * dashboardData.ac_current
    return theoreticalMax > 0 ? Math.min(100, (dashboardData.real_power / theoreticalMax) * 100) : 0
  }

  // Show loading while checking authentication
  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to solar monitoring system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">HTWK Real-time Solar Monitoring</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Secure Session
              </Badge>
              <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500" : ""}>
                {isConnected ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                {isConnected ? "Live Data" : "Demo Mode"}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <RefreshCw className="h-3 w-3 mr-1" />
                Updates: {updateCount}
              </Badge>
              <span className="text-sm text-gray-600">Last: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Current Power</p>
                  <p className="text-2xl font-bold">{dashboardData?.real_power?.toFixed(1) || "0"} W</p>
                  <p className="text-xs text-orange-200">
                    {dashboardData?.real_power && dashboardData.real_power > 0 ? "Generating" : "Standby"}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">AC Voltage</p>
                  <p className="text-2xl font-bold">{dashboardData?.ac_voltage?.toFixed(1) || "0"} V</p>
                  <p className="text-xs text-blue-200">Grid connection</p>
                </div>
                <Gauge className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">AC Current</p>
                  <p className="text-2xl font-bold">{dashboardData?.ac_current?.toFixed(1) || "0"} A</p>
                  <p className="text-xs text-green-200">System load</p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">System Efficiency</p>
                  <p className="text-2xl font-bold">{calculateEfficiency().toFixed(1)}%</p>
                  <p className="text-xs text-purple-200">Performance ratio</p>
                </div>
                <Battery className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                System Conditions
              </CardTitle>
              <CardDescription>Temperature and frequency monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Inverter Temperature</span>
                  <span
                    className={`text-sm font-bold ${getStatusColor(dashboardData?.temp_inverter || 0, 10, 70, { min: 20, max: 50 })}`}
                  >
                    {dashboardData?.temp_inverter?.toFixed(1) || "0"}°C
                  </span>
                </div>
                <Progress value={getProgressValue(dashboardData?.temp_inverter || 0, 80)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Optimal range: 20-50°C</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">AC Output Frequency</span>
                  <span
                    className={`text-sm font-bold ${getStatusColor(dashboardData?.ac_freq || 0, 49.5, 50.5, { min: 49.8, max: 50.2 })}`}
                  >
                    {dashboardData?.ac_freq?.toFixed(2) || "0"} Hz
                  </span>
                </div>
                <Progress value={getProgressValue((dashboardData?.ac_freq || 50) - 49, 2)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Standard: 50 ± 0.2 Hz</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Energy Production Metrics
              </CardTitle>
              <CardDescription>Daily power generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Daily Production</span>
                  <span className="text-sm font-bold text-green-600">
                    {dashboardData?.daily_prod?.toFixed(2) || "0"} kWh
                  </span>
                </div>
                <Progress value={getProgressValue(dashboardData?.daily_prod || 0, 50)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Daily target: 40 kWh</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Cumulative Production</span>
                  <span className="text-sm font-bold text-blue-600">
                    {dashboardData?.cumulative_prod?.toFixed(1) || "0"} kWh
                  </span>
                </div>
                <Progress value={getProgressValue(dashboardData?.cumulative_prod || 0, 10000)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Total system output</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status and Data Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Real-time Data Connection
              </CardTitle>
              <CardDescription>Live data feed from inverter systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-4 rounded-lg ${isConnected ? "bg-green-50" : "bg-blue-50"}`}>
                  {isConnected ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Database className="h-6 w-6 text-blue-500" />
                  )}
                  <div>
                    <p className={`font-medium ${isConnected ? "text-green-900" : "text-blue-900"}`}>
                      Inverter Data Feed
                    </p>
                    <p className={`text-sm ${isConnected ? "text-green-600" : "text-blue-600"}`}>
                      {isConnected ? "Connected - Live data streaming" : "Demo mode - Simulated data"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Wifi className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium text-green-900">API Connection</p>
                    <p className="text-sm text-green-600">Active - 2s refresh rate</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Activity className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium text-green-900">Data Processing</p>
                    <p className="text-sm text-green-600">Real-time - {updateCount} updates received</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current System Status
              </CardTitle>
              <CardDescription>Live system health and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-900">Power Output</p>
                    <p className="text-lg font-bold text-orange-600">
                      {dashboardData?.real_power?.toFixed(0) || "0"} W
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">System Voltage</p>
                    <p className="text-lg font-bold text-blue-600">{dashboardData?.ac_voltage?.toFixed(1) || "0"} V</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Current Draw</p>
                    <p className="text-lg font-bold text-green-600">{dashboardData?.ac_current?.toFixed(1) || "0"} A</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">Temperature</p>
                    <p className="text-lg font-bold text-purple-600">
                      {dashboardData?.temp_inverter?.toFixed(1) || "0"}°C
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Last Data Update:</span>
                    <span className="text-sm text-gray-600">
                      {dashboardData?.last_update ? new Date(dashboardData.last_update).toLocaleString() : "No data"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-700">System Status:</span>
                    <Badge
                      variant={isConnected ? "default" : "secondary"}
                      className={isConnected ? "bg-green-500" : ""}
                    >
                      {dashboardData?.status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Predictions Preview */}
        {dashboardData?.predictions && dashboardData.predictions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Live AI Predictions Preview
              </CardTitle>
              <CardDescription>Next hour power generation forecast from LSTM neural network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/predictive")}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  View Full AI Predictions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
