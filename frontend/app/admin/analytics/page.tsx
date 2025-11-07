"use client"

import RequestsAnalytics from "@/components/admin/requests-analytics"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Requests Analytics</h2>
        <p className="text-slate-400 text-sm">View analytics for all requests</p>
      </div>
      <RequestsAnalytics />
    </div>
  )
}