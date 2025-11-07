"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useAssetStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Building2, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { OwnedFractionalNFT } from "@/lib/contract-types"

interface OwnershipData {
  totalAssets: number
  fractionalOwnership: OwnedFractionalNFT[]
}

export default function PortfolioDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { ownedFractionalNFTs, loadOwnedFractionalNFTs } = useAssetStore()
  const [ownershipData, setOwnershipData] = useState<OwnershipData | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user.isConnected) {
      router.push("/")
      return
    }

    const loadData = async () => {
      if(user.address)
        await loadOwnedFractionalNFTs(user.address);
    };

    loadData();
  }, [user, loadOwnedFractionalNFTs, router])

  useEffect(() => {
    if (!user.isConnected) return;

    setOwnershipData({
      totalAssets: ownedFractionalNFTs.length,
      fractionalOwnership: ownedFractionalNFTs,
    })
  }, [user, ownedFractionalNFTs])

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!mounted || !ownershipData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading portfolio...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-black opacity-50"></div>
      <div className="border-b border-gray-700 bg-gray-800/60 backdrop-blur-lg sticky top-0 z-50 shadow-md shadow-blue-500/10">
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
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-gray-600 bg-transparent hover:bg-gray-700 hover:text-white transition-all">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-lg shadow-lg shadow-blue-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-400 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Assets Owned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{ownershipData.totalAssets}</div>
              <p className="text-xs text-gray-500 mt-1">Approved tokenized assets</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-lg shadow-lg shadow-blue-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-400 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-mono text-gray-300 truncate">{user.address}</p>
              <p className="text-xs text-gray-500 mt-2">Ethereum Network</p>
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
              {ownershipData.fractionalOwnership.map((holding, index) => {
                return (
                  <Card
                    key={index}
                    className="border-gray-700 bg-gray-800/60 backdrop-blur-lg hover:border-gray-600 transition-colors shadow-md hover:shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white">{holding.propertyName}</CardTitle>
                          <CardDescription className="text-gray-400">Token ID: {holding.propertyId}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Ownership Stake</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                                style={{ width: `${holding.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-white">{holding.percentage.toFixed(2)}%</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-700">
                          <p className="text-xs text-gray-500">
                            You own <span className="text-white font-semibold">{holding.percentage.toFixed(2)}%</span> of this
                            property
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-lg shadow-lg shadow-blue-500/10">
              <CardContent className="pt-12 text-center">
                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No tokenized assets in your portfolio yet</p>
                <p className="text-sm text-gray-500 mt-1">Check back when new assets are listed</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}