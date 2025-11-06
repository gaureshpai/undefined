"use client"

import { useAssetStore } from "@/lib/store"
import { requestService } from "@/lib/request-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react"

export default function RequestAnalytics() {
  const { requests } = useAssetStore()
  const analytics = requestService.getAnalytics(requests)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-400 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Total Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{analytics.totalRequests}</div>
          <p className="text-xs text-slate-500 mt-1">All time requests</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Approved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">{analytics.approved}</div>
          <p className="text-xs text-slate-500 mt-1">{analytics.approvalRate}% approval rate</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-400 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-400">{analytics.pending}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-400 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Rejected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-400">{analytics.rejected}</div>
          <p className="text-xs text-slate-500 mt-1">Not approved</p>
        </CardContent>
      </Card>
    </div>
  )
}
