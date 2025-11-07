"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, List } from "lucide-react"
import RequestNotifications from "@/components/admin/request-notifications"
import AdminNav from "@/components/admin/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!user.isConnected || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, router, isLoading])

  if (!user.isConnected || user.role !== "admin") return null

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <RequestNotifications />

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-600 to-orange-600 flex items-center justify-center">
              <List className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">AssetChain Admin</h1>
              <p className="text-xs text-slate-400">Asset Management System</p>
            </div>
          </div>

          <AdminNav />

          <Button
            onClick={handleLogout}
            size="sm"
            className="border-slate-600 bg-black/30 hover:bg-black/40 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
