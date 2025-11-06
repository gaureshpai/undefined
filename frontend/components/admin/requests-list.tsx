"use client"

import { useAssetStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock } from "lucide-react"

export default function RequestsList() {
  const { requests, updateRequestStatus, buildings } = useAssetStore()

  const getRequestedBuilding = (buildingId: string) => {
    return buildings.find((b:any) => b.id === buildingId)
  }

  if (requests.length === 0) {
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

  const pendingRequests = requests.filter((r:any) => r.status === "pending")

  return (
    <div className="space-y-4">
      {pendingRequests.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
          <CardContent className="pt-12 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-400">All requests processed</p>
            <p className="text-sm text-slate-500 mt-1">No pending requests to review</p>
          </CardContent>
        </Card>
      ) : (
        pendingRequests.map((request:any) => {
          const building = getRequestedBuilding(request.buildingAssetId)
          return (
            <Card key={request.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">{building?.name || "Unknown Building"}</CardTitle>
                    <CardDescription className="text-slate-400">
                      Requested by:{" "}
                      <span className="font-mono text-slate-500">{request.requestedBy.slice(0, 10)}...</span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Request ID</p>
                      <p className="font-mono text-slate-300">{request.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Created</p>
                      <p className="text-slate-300">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {building && (
                    <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                      <p className="text-xs text-slate-500 mb-2">Asset Details</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">Location: {building.location}</p>
                        <p className="text-slate-300">Token: {building.tokenId}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-20 pt-4 border-t border-slate-700">
                    <Button
                      onClick={() => updateRequestStatus(request.id, "approved")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateRequestStatus(request.id, "rejected")}
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
        })
      )}
    </div>
  )
}
