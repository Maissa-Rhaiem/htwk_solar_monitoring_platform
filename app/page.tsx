"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sun, Zap, Brain, Shield, AlertCircle, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

// Single valid credential - only for the developer
const VALID_CREDENTIAL = {
  email: "admin@solarmonitor.com",
  secretCode: "HTWK_2025",
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate input
    if (!email.trim() || !secretCode.trim()) {
      setError("Please enter both email address and secret code")
      setIsLoading(false)
      return
    }

    // Check credentials against the single valid credential
    const isValidCredential =
      email.trim() === VALID_CREDENTIAL.email && secretCode.trim() === VALID_CREDENTIAL.secretCode

    // Simulate authentication delay
    setTimeout(() => {
      if (isValidCredential) {
        // Store authentication token
        const authToken = btoa(`${email}:${Date.now()}`) // Simple token
        localStorage.setItem("authToken", authToken)
        localStorage.setItem(
          "user",
          JSON.stringify({
            email,
            loginTime: new Date().toISOString(),
            authenticated: true,
          }),
        )

        setIsLoading(false)
        router.push("/dashboard")
      } else {
        setError("Access denied. Invalid credentials.")
        setIsLoading(false)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Platform Information */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full">
                <Sun className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                HTWK_Solar Monitoring Platform
              </h1>
            </div>
            <p className="text-xl text-gray-600"></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg backdrop-blur-sm">
              <Zap className="h-8 w-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Real-time Monitoring</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg backdrop-blur-sm">
              <Brain className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">AI Predictions</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg backdrop-blur-sm">
              <Shield className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Exclusive Access</span>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-600 bg-white/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Capabilities</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Real-time solar panel performance monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI-powered energy production forecasting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Advanced system analytics and reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Comprehensive performance optimization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Secure Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="h-6 w-6 text-gray-600" />
              <CardTitle className="text-2xl font-bold">Authorized Access Only</CardTitle>
            </div>
            <CardDescription>Enter your credentials to access the solar monitoring platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretCode">Access Code</Label>
                <Input
                  id="secretCode"
                  type="password"
                  placeholder="Enter your access code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Platform"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">🔒 This platform requires authorized credentials for access</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


