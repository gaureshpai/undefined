"use client"

import RequestsList from "@/components/admin/requests-list"

export default function AllRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">All Requests</h2>
        <p className="text-muted-foreground text-sm">View and manage all requests</p>
      </div>
      <RequestsList />
    </div>
  )
}