"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Building2,
  BarChart3,
  FileSpreadsheet,
  Banknote,
  ShoppingBag,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

const links = [
  { href: "/admin/buildings", text: "Buildings", icon: Building2 },
  { href: "/admin/analytics", text: "Analytics", icon: BarChart3 },
  { href: "/admin/all-requests", text: "All Requests", icon: FileSpreadsheet },
  { href: "/admin/transactions", text: "Transactions", icon: Banknote },
  { href: "/marketplace", text: "Marketplace", icon: ShoppingBag },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 bg-card border border-border rounded-xl px-3 py-2 backdrop-blur shadow-sm">
      {links.map(({ href, text, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "flex items-center gap-2 text-sm text-muted-foreground transition-all duration-200",
              "hover:text-foreground hover:bg-accent",
              isActive && "bg-primary/20 text-primary border border-primary/40"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{text}</span>
          </Link>
        )
      })}
    </nav>
  )
}