"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, SquarePlus, List, CheckCircle2 } from "lucide-react"
import CreateBuildingForm from "@/components/admin/create-building-form"
import BuildingsList from "@/components/admin/buildings-list"
import RequestsList from "@/components/admin/requests-list"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("buildings")

  if (!user.isConnected || user.role !== "admin") {
    router.push("/")
    return null
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-600 to-orange-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">AssetChain Admin</h1>
              <p className="text-xs text-slate-400">Asset Management System</p>
            </div>
          </div>
          <Button onClick={handleLogout} size="sm" className="border-slate-600 bg-black/30 hover:bg-black/40 text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50 mb-8">
            <TabsTrigger value="buildings" className="data-[state=active]:bg-amber-600 text-white data-[state=active]:text-black flex items-center gap-2  transition-all duration-200">
              <SquarePlus className="w-4 h-4" />
              Create Building
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-amber-600 text-white data-[state=active]:text-black flex items-center gap-2  transition-all duration-200">
              <List className="w-4 h-4" />
              Buildings
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-amber-600 text-white data-[state=active]:text-black flex items-center gap-2  transition-all duration-200">
              <CheckCircle2 className="w-4 h-4" />
              Requests
            </TabsTrigger>
          </TabsList>

          {/* Create Building Tab */}
          <TabsContent value="buildings" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Asset Token</h2>
              <p className="text-slate-400 text-sm">Create a new tokenized building asset and assign ownership</p>
            </div>
            <CreateBuildingForm />
          </TabsContent>

          {/* Buildings List Tab */}
          <TabsContent value="list" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">All Buildings</h2>
              <p className="text-slate-400 text-sm">Manage and view all tokenized assets</p>
            </div>
            <BuildingsList />
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Pending Requests</h2>
              <p className="text-slate-400 text-sm">Review and approve/reject tokenization requests</p>
            </div>
            <RequestsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
