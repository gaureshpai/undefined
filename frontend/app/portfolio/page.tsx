"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useAssetStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, TrendingUp, Building2, Wallet, FileCheck } from "lucide-react"
import { useEffect, useState } from "react"

interface OwnershipData {
  totalAssets: number
  totalValue: string
  fractionalOwnership: Array<{
    buildingName: string
    percentage: number
    tokenId: string
  }>
}

export default function PortfolioDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { buildings } = useAssetStore()
  const [ownershipData, setOwnershipData] = useState<OwnershipData | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user.isConnected || user.role === "admin") {
      router.push("/")
      return
    }

    // Calculate user's ownership portfolio
    const userAssets = buildings
      .filter((b:any) => b.status === "approved" && b.fractionalOwnership?.some((o:any) => o.address === user.address))
      .map((b:any) => {
        const ownership = b.fractionalOwnership?.find((o:any) => o.address === user.address)
        return {
          buildingName: b.name,
          percentage: ownership?.percentage || 0,
          tokenId: b.tokenId,
        }
      })

    setOwnershipData({
      totalAssets: userAssets.length,
      totalValue: `$${(Math.random() * 1000000 + 500000).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      fractionalOwnership: userAssets,
    })
  }, [user, buildings, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!mounted || !ownershipData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading portfolio...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">AssetChain</h1>
              <p className="text-xs text-slate-400">Portfolio</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Connected</p>
              <p className="text-xs text-slate-500 font-mono truncate max-w-xs">
                {user.address?.slice(0, 6)}...{user.address?.slice(-4)}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-600 bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Assets Owned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{ownershipData.totalAssets}</div>
              <p className="text-xs text-slate-500 mt-1">Approved tokenized assets</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{ownershipData.totalValue}</div>
              <p className="text-xs text-green-400 mt-1">+12% this month</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-mono text-slate-300 truncate">{user.address}</p>
              <p className="text-xs text-slate-500 mt-2">Ethereum Network</p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">Your Holdings</h2>
            <p className="text-slate-400 text-sm">Fractional ownership of tokenized assets</p>
          </div>

          {ownershipData.fractionalOwnership.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownershipData.fractionalOwnership.map((holding, index) => (
                <Card
                  key={index}
                  className="border-slate-700 bg-slate-800/50 backdrop-blur-lg hover:border-slate-600 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{holding.buildingName}</CardTitle>
                        <CardDescription className="text-slate-400">Token: {holding.tokenId}</CardDescription>
                      </div>
                      <FileCheck className="w-5 h-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Ownership Stake</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                              style={{ width: `${holding.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-white">{holding.percentage}%</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-500">
                          You own <span className="text-white font-semibold">{holding.percentage}%</span> of this
                          property
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
              <CardContent className="pt-12 text-center">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No tokenized assets in your portfolio yet</p>
                <p className="text-sm text-slate-500 mt-1">Check back when new assets are listed</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
