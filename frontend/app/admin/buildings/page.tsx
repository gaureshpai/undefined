"use client"

import BuildingsList from "@/components/admin/buildings-list"

export default function BuildingsListPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">All Buildings</h2>
        <p className="text-slate-400 text-sm">Manage and view all tokenized assets</p>
      </div>
      <BuildingsList />
    </div>
  )
}