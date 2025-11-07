"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function UserNav() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const short = (addr?: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white font-semibold">AssetChain</Link>
          <nav className="hidden md:flex items-center gap-4 text-slate-300 text-sm">
            <Link href="/portfolio" className="hover:text-white">Portfolio</Link>
            <Link href="/create-request" className="hover:text-white">Create Request</Link>
            <Link href="/marketplace" className="hover:text-white">Marketplace</Link>
            {user.role === "admin" && (
              <Link href="/admin" className="hover:text-white">Admin</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {user.isConnected ? (
            <>
              <span className="text-xs text-slate-400 font-mono hidden sm:block">{short(user.address)}</span>
              <Button size="sm" variant="outline" className="border-slate-700 text-black hover:text-slate-700" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/" className="text-sm text-blue-400 hover:underline">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
