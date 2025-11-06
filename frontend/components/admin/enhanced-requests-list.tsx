"use client"

import { useState } from "react"
import { useAssetStore } from "@/lib/store"
import { requestService } from "@/lib/request-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, AlertCircle } from "lucide-react"

interface RequestNotification {
  id: string
  type: "success" | "error"
  message: string
}

export default function EnhancedRequestsList() {
  const { requests, updateRequestStatus, buildings } = useAssetStore()
  const [notifications, setNotifications] = useState<RequestNotification[]>([])

  const getRequestedBuilding = (buildingId: string) => {
    return buildings.find((b: any) => b.id === buildingId)
  }

  const handleApprove = (requestId: string, buildingId: string) => {
    const building = getRequestedBuilding(buildingId)
    if (building) {
      const result = requestService.approveRequest(requests.find((r:any) => r.id === requestId)!, building)

      updateRequestStatus(requestId, "approved")

      setNotifications((prev) => [
        ...prev,
        {
          id: `notif-${Date.now()}`,
          type: "success",
          message: result.message,
        },
      ])

      setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== `notif-${Date.now()}`)), 3000)
    }
  }

  const handleReject = (requestId: string, buildingId: string) => {
    const building = getRequestedBuilding(buildingId)
    if (building) {
      const result = requestService.rejectRequest(
        requests.find((r:any) => r.id === requestId)!,
        building,
        "Rejected by admin",
      )

      updateRequestStatus(requestId, "rejected")

      setNotifications((prev) => [
        ...prev,
        {
          id: `notif-${Date.now()}`,
          type: "success",
          message: result.message,
        },
      ])

      setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== `notif-${Date.now()}`)), 3000)
    }
  }

  const pendingRequests = requests.filter((r:any) => r.status === "pending")

  if (pendingRequests.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardContent className="pt-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No pending requests</p>
          <p className="text-sm text-slate-500 mt-1">All requests have been processed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {pendingRequests.map((request:any) => {
          const building = getRequestedBuilding(request.buildingAssetId)

          return (
            <Card
              key={request.id}
              className="border-slate-700 bg-slate-800/50 backdrop-blur-lg hover:border-slate-600 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">{building?.name || "Unknown Building"}</CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      Requested by:{" "}
                      <span className="font-mono text-slate-500">{request.requestedBy.slice(0, 10)}...</span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Request ID</p>
                      <p className="font-mono text-slate-300 text-xs truncate">{request.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Location</p>
                      <p className="text-slate-300">{building?.location}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Created</p>
                      <p className="text-slate-300">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {building && (
                    <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-blue-400 flex shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-400 font-semibold mb-1">Documents Attached</p>
                          <ul className="text-slate-400 space-y-1 text-xs">
                            <li>✓ Partnership Agreement</li>
                            <li>✓ Maintenance Agreement</li>
                            <li>✓ Rent Agreement</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-700">
                    <Button
                      onClick={() => handleApprove(request.id, request.buildingAssetId)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id, request.buildingAssetId)}
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg text-sm ${
              notif.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>
    </>
  )
}
