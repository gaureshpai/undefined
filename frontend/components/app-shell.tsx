"use client";

import { usePathname } from "next/navigation";
import UserNav from "@/components/user/user-nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {!isAdmin && <UserNav />}
      <main>{children}</main>
    </div>
  );
}
