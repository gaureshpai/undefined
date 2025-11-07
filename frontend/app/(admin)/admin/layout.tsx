"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, List } from "lucide-react"
import AdminNav from "@/components/admin/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  // Initialize signer for admin using env private key (client-side public env)
  // Simple guard: show minimal message instead of redirecting
  if (!user.isConnected || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div>Admin access required</div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push("/admin-login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <List className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-foreground font-bold">AssetChain Admin</h1>
              <p className="text-xs text-muted-foreground">Asset Management System</p>
            </div>
          </div>

          <AdminNav />

          <Button
            onClick={handleLogout}
            size="sm"
            variant="outline"
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
