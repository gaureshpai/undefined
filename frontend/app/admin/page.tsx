"use client"

import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Admin Console</h2>
        <p className="text-slate-400 text-sm">Use the navbar to navigate. Quick links below:</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/buildings" className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-600">Buildings</Link>
        <Link href="/admin/all-requests" className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-600">All Requests</Link>
        <Link href="/admin/analytics" className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-600">Analytics</Link>
        <Link href="/admin/transactions" className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-600">Transactions</Link>
        <Link href="/marketplace" className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-600">Marketplace</Link>
      </div>
    </div>
  )
}
