"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Brain,
  TrendingUp,
  Zap,
  Activity,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Thermometer,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface PredictionData {
  timestamp: string
  predicted_power: number
  method?: string
  confidence?: number
}

interface DashboardData {
  timestamp: string
  real_power: number
  temp_inverter: number
  predictions: PredictionData[]
  status: string
  model_accuracy: number
  predictions_today: number
  last_update: string
}

export default function PredictivePage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication
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

  // Load dashboard data
  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = async () => {
      try {
        const response = await fetch("/api/dashboard-data", { cache: "no-store" })
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [isAuthenticated])

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI predictions...</p>
        </div>
      </div>
    )
  }

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString()
    } catch {
      return timestamp
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 border-green-200 bg-green-50"
      case "completed":
        return "text-blue-600 border-blue-200 bg-blue-50"
      default:
        return "text-gray-600 border-gray-200 bg-gray-50"
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "LSTM":
        return "bg-purple-100 text-purple-800"
      case "Trend-based":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">HTWK AI Predictive Analytics</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Authorized Access
              </Badge>
              <Badge
                variant="outline"
                className={`${dashboardData?.model_accuracy || 0 > 0 ? "text-purple-600 border-purple-200" : "text-gray-600 border-gray-200"}`}
              >
                <Brain className="h-3 w-3 mr-1" />
                Model: {dashboardData?.model_accuracy?.toFixed(1) || "0.0"}% Accuracy
              </Badge>
              <span className="text-sm text-gray-500">
                Updated:{" "}
                {dashboardData?.last_update ? new Date(dashboardData.last_update).toLocaleTimeString() : "Never"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Current Power</p>
                  <p className="text-2xl font-bold">{dashboardData?.real_power?.toFixed(1) || "0"} W</p>
                  <p className="text-xs text-orange-200">Live reading</p>
                </div>
                <Zap className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Model Accuracy</p>
                  <p className="text-2xl font-bold">{dashboardData?.model_accuracy?.toFixed(1) || "0.0"}%</p>
                  <p className="text-xs text-purple-200">LSTM Neural Network</p>
                </div>
                <Brain className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Predictions Today</p>
                  <p className="text-2xl font-bold">{dashboardData?.predictions_today || 0}</p>
                  <p className="text-xs text-blue-200">Active forecasts</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">System Temp</p>
                  <p className="text-2xl font-bold">{dashboardData?.temp_inverter?.toFixed(1) || "0"}°C</p>
                  <p className="text-xs text-green-200">Inverter temperature</p>
                </div>
                <Thermometer className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Power Predictions
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Models & Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Real-time Power Generation Forecast
                </CardTitle>
                <CardDescription>
                  LSTM neural network predictions based on historical data patterns and current system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.predictions && dashboardData.predictions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {dashboardData.predictions.slice(0, 4).map((pred, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">{formatTime(pred.timestamp)}</span>
                            {pred.method && (
                              <Badge variant="secondary" className={getMethodColor(pred.method)}>
                                {pred.method}
                              </Badge>
                            )}
                          </div>
                          <p className="text-2xl font-bold text-purple-600 mb-1">{pred.predicted_power.toFixed(1)} W</p>
                          {pred.confidence && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Confidence</span>
                                <span>{pred.confidence.toFixed(1)}%</span>
                              </div>
                              <Progress value={pred.confidence} className="h-1" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {dashboardData.predictions.length > 4 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Extended Forecast</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {dashboardData.predictions.slice(4).map((pred, index) => (
                            <div
                              key={index + 4}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium">{formatTime(pred.timestamp)}</p>
                                <p className="text-xs text-gray-500">{pred.method || "Unknown"}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-purple-600">{pred.predicted_power.toFixed(1)} W</p>
                                {pred.confidence && (
                                  <p className="text-xs text-gray-500">{pred.confidence.toFixed(1)}% confidence</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Available</h3>
                    <p className="text-gray-500 mb-4">
                      Start the real-time simulation to generate AI-powered predictions
                    </p>
                    <Badge variant="outline" className={getStatusColor(dashboardData?.status || "demo")}>
                      Status: {dashboardData?.status || "demo"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    LSTM Model Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Model Accuracy</span>
                      <span className="text-lg font-bold text-purple-600">
                        {dashboardData?.model_accuracy?.toFixed(1) || "0.0"}%
                      </span>
                    </div>
                    <Progress value={dashboardData?.model_accuracy || 0} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{dashboardData?.predictions_today || 0}</p>
                      <p className="text-xs text-gray-600">Predictions Today</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">96</p>
                      <p className="text-xs text-gray-600">Sequence Length</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Collection</span>
                      <Badge variant="outline" className={getStatusColor(dashboardData?.status || "demo")}>
                        {dashboardData?.status === "active"
                          ? "Active"
                          : dashboardData?.status === "completed"
                            ? "Completed"
                            : "Demo Mode"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Models</span>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Predictions</span>
                      <Badge
                        variant="outline"
                        className={
                          dashboardData?.predictions && dashboardData.predictions.length > 0
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-gray-600 border-gray-200 bg-gray-50"
                        }
                      >
                        {dashboardData?.predictions && dashboardData.predictions.length > 0 ? "Active" : "Waiting"}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">Last Update</p>
                    <p className="text-sm font-medium">
                      {dashboardData?.last_update ? new Date(dashboardData.last_update).toLocaleString() : "Never"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Model Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🧠 Neural Network</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Type:</strong> LSTM (Long Short-Term Memory)
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Input:</strong> 96 timesteps (24 hours)
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Output:</strong> 4 predictions (1 hour ahead)
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">📊 Data Processing</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Interval:</strong> 15 minutes
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Features:</strong> Power generation data
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Scaling:</strong> MinMax normalization
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Performance</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Accuracy:</strong> {dashboardData?.model_accuracy?.toFixed(1) || "0.0"}%
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Horizon:</strong> 1 hour ahead
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Update:</strong> Real-time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

