"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Wallet, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  const router = useRouter()
  const { user, loginWithMetaMask, adminLogin, isLoading } = useAuth()
  const [adminPassword, setAdminPassword] = useState("")
  const [adminError, setAdminError] = useState("")
  const [activeTab, setActiveTab] = useState("user")

  if (user.isConnected) {
    router.push(user.role === "admin" ? "/admin" : "/portfolio")
    return null
  }

  const handleMetaMaskLogin = async () => {
    await loginWithMetaMask()
  }

  const handleAdminLogin = () => {
    setAdminError("")
    const success = adminLogin(adminPassword)
    if (success) {
      router.push("/admin")
    } else {
      setAdminError("Invalid password. Please try again.")
      setAdminPassword("")
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AssetChain</h1>
          <p className="text-slate-400">Tokenized Asset Management</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white">Login</CardTitle>
            <CardDescription>Choose your login method to continue</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                <TabsTrigger value="user" className="data-[state=active]:bg-blue-600">
                  User
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-blue-600">
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* User Login Tab */}
              <TabsContent value="user" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 text-center mb-4">
                    Connect your MetaMask wallet to access your portfolio
                  </p>

                  <Button
                    onClick={handleMetaMaskLogin}
                    disabled={isLoading}
                    size="lg"
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-12 rounded-lg transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Connect MetaMask
                      </div>
                    )}
                  </Button>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-xs text-blue-400">
                      💡 Make sure you have MetaMask installed and a valid Ethereum wallet to proceed.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Admin Login Tab */}
              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 text-center mb-4">Admin only. Enter your password to continue</p>

                  {adminError && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-400">{adminError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Admin Password</label>
                    <Input
                      type="password"
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value)
                        setAdminError("")
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAdminLogin()
                        }
                      }}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <Button
                    onClick={handleAdminLogin}
                    size="lg"
                    className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold h-12 rounded-lg transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Login as Admin
                    </div>
                  </Button>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-xs text-amber-400">
                      🔐 Admin dashboard provides access to building creation, management, and request approval
                      features.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
