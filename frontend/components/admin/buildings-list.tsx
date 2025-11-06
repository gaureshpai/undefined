"use client"

import { useAssetStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, User } from "lucide-react"

export default function BuildingsList() {
  const { buildings } = useAssetStore()

  if (buildings.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardContent className="pt-12 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No buildings created yet</p>
          <p className="text-sm text-slate-500 mt-1">Create your first tokenized asset</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {buildings.map((building:any) => (
        <Card
          key={building.id}
          className="border-slate-700 bg-slate-800/50 backdrop-blur-lg hover:border-slate-600 transition-colors"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  {building.name}
                </CardTitle>
                <CardDescription className="text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {building.location}
                </CardDescription>
              </div>
              <Badge
                variant={
                  building.status === "approved"
                    ? "default"
                    : building.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
                className={
                  building.status === "approved"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : building.status === "rejected"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                }
              >
                {building.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Token ID</p>
                <p className="text-sm font-mono text-slate-300">{building.tokenId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Owner</p>
                <p className="text-sm font-mono text-slate-300 truncate">{building.owner.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Created</p>
                <p className="text-sm text-slate-300">{new Date(building.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Documents</p>
                <p className="text-sm text-slate-300">3 attached</p>
              </div>
            </div>

            {building.fractionalOwnership && building.fractionalOwnership.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-2">Ownership Structure</p>
                <div className="space-y-2">
                  {building.fractionalOwnership.map((owner:any, idx:number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-slate-500" />
                        <span className="font-mono text-slate-400 truncate">{owner.address.slice(0, 12)}...</span>
                      </div>
                      <span className="text-slate-300 font-semibold">{owner.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
