"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, Wifi, LogOut, BarChart3, LineChart, Shield, Activity, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import SimulationControl from "@/components/simulation-control"

interface DashboardData {
  status: string
  last_update: string
}

export default function Dashboard() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard-data", { cache: "no-store" })
        if (response.ok) {
          const data = await response.json()
          setDashboardData({
            status: data.status,
            last_update: data.last_update,
          })
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
        setDashboardData({
          status: "demo",
          last_update: new Date().toISOString(),
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
    const interval = setInterval(loadDashboardData, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check authentication
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

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  const navigateToRealTime = () => {
    router.push("/realtime")
  }

  const navigateToPredictive = () => {
    router.push("/predictive")
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform...</p>
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                  HTWK Solar Monitoring Platform
                </h1>
                <p className="text-xs text-gray-500">Real-time AI-powered monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Authorized
              </Badge>
              <Badge
                variant="outline"
                className={`${dashboardData?.status === "active" ? "text-green-600 border-green-200" : "text-blue-600 border-blue-200"}`}
              >
                <Wifi className="h-3 w-3 mr-1" />
                {dashboardData?.status === "active" ? "Live Data" : "Demo Mode"}
              </Badge>
              <span className="text-sm text-gray-600">{currentTime}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Solar Monitoring Dashboard</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitor your solar system with real-time data visualization and AI-powered predictions
          </p>
        </div>

        {/* Simulation Control */}
        <div className="mb-12">
          <SimulationControl
            onStatusChange={(status) => {
              if (dashboardData) {
                setDashboardData({ ...dashboardData, status })
              }
            }}
          />
        </div>

        {/* Main Navigation Cards - Only 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Real-time Monitoring */}
          <Card
            className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-300 hover:scale-105"
            onClick={navigateToRealTime}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Real-time Monitoring</CardTitle>
              <CardDescription className="text-base">Live system data visualization</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Monitor live data from your solar installations with comprehensive system metrics and real-time charts.
              </p>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg py-3">
                <Activity className="h-5 w-5 mr-2" />
                View Live Data
              </Button>
            </CardContent>
          </Card>

          {/* AI Predictions */}
          <Card
            className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 hover:scale-105"
            onClick={navigateToPredictive}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-110 transition-transform">
                <LineChart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">AI Forecasting</CardTitle>
              <CardDescription className="text-base">Machine learning predictions</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Advanced LSTM neural networks provide accurate power generation forecasts and predictive analytics.
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg py-3">
                <Brain className="h-5 w-5 mr-2" />
                View Predictions
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
