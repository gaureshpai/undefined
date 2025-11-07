"use client"

import { useState, useEffect } from "react"
import { useAssetStore } from "@/lib/store"
import { requestService } from "@/lib/request-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, AlertCircle, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MediatedTransferProposal, approveTransfer, approveTransferByMediator, rejectTransfer, executeTransfer } from "@/lib/mediated-transfer-service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface RequestNotification {
  id: string
  type: "success" | "error"
  message: string
}

interface PropertyDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number | null;
  building: any; // Replace 'any' with actual BuildingAsset type if available
}

const PropertyDetailsDialog = ({ isOpen, onClose, propertyId, building }: PropertyDetailsDialogProps) => {
  if (!isOpen || !propertyId || !building) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Property Details (ID: {propertyId})</DialogTitle>
          <DialogDescription className="text-slate-400">
            Information about the property involved in the mediated transfer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-slate-400 col-span-1">Name:</p>
            <p className="col-span-3 font-semibold">{building.name}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-slate-400 col-span-1">Location:</p>
            <p className="col-span-3">{building.location}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-slate-400 col-span-1">Owner:</p>
            <p className="col-span-3 font-mono text-sm">{building.owner}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-slate-400 col-span-1">Token ID:</p>
            <p className="col-span-3 font-mono text-sm">{building.tokenId}</p>
          </div>
          {/* Add more property details as needed */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function EnhancedRequestsList() {
  const { requests, updateRequestStatus, buildings, mediatedTransferProposals, loadMediatedTransferProposals, updateMediatedTransferProposalStatus } = useAssetStore();
  const { signer, user } = useAuth();
  const [notifications, setNotifications] = useState<RequestNotification[]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  useEffect(() => {
    loadMediatedTransferProposals();
  }, [loadMediatedTransferProposals]);

  const getRequestedBuilding = (buildingId: string) => {
    return buildings.find((b: any) => b.id === buildingId);
  };

  const handleApprove = (requestId: string, buildingId: string) => {
    const building = getRequestedBuilding(buildingId);
    if (building) {
      const result = requestService.approveRequest(requests.find((r:any) => r.id === requestId)!, building);

      updateRequestStatus(requestId, "approved");

      setNotifications((prev) => [
        ...prev,
        {
          id: `notif-${Date.now()}`,
          type: "success",
          message: result.message,
        },
      ]);

      setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== `notif-${Date.now()}`)), 3000);
    }
  };

  const handleReject = (requestId: string, buildingId: string) => {
    const building = getRequestedBuilding(buildingId);
    if (building) {
      const result = requestService.rejectRequest(
        requests.find((r:any) => r.id === requestId)!,
        building,
        "Rejected by admin",
      );

      updateRequestStatus(requestId, "rejected");

      setNotifications((prev) => [
        ...prev,
        {
          id: `notif-${Date.now()}`,
          type: "success",
          message: result.message,
        },
      ]);

      setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== `notif-${Date.now()}`)), 3000);
    }
  };

  const handleOwnerApproveTransfer = async (proposal: MediatedTransferProposal) => {
    if (!signer) {
      toast.error("Wallet not connected.");
      return;
    }
    try {
      const result = await approveTransfer(signer, proposal.propertyId);
      toast.success(result.message);
      loadMediatedTransferProposals(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to approve mediated transfer as owner:", error);
      toast.error(error.message || "Failed to approve mediated transfer.");
    }
  };

  const handleOwnerRejectTransfer = async (proposal: MediatedTransferProposal) => {
    if (!signer) {
      toast.error("Wallet not connected.");
      return;
    }
    try {
      const result = await rejectTransfer(signer, proposal.propertyId);
      toast.success(result.message);
      loadMediatedTransferProposals(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to reject mediated transfer as owner:", error);
      toast.error(error.message || "Failed to reject mediated transfer.");
    }
  };

  const handleMediatorApproveTransfer = async (proposal: MediatedTransferProposal) => {
    if (!signer) {
      toast.error("Wallet not connected.");
      return;
    }
    try {
      const result = await approveTransferByMediator(signer, proposal.propertyId);
      toast.success(result.message);
      loadMediatedTransferProposals(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to approve mediated transfer by mediator:", error);
      toast.error(error.message || "Failed to approve mediated transfer.");
    }
  };

  const handleMediatorRejectTransfer = async (proposal: MediatedTransferProposal) => {
    if (!signer) {
      toast.error("Wallet not connected.");
      return;
    }
    try {
      const result = await rejectTransfer(signer, proposal.propertyId);
      toast.success(result.message);
      loadMediatedTransferProposals(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to reject mediated transfer by mediator:", error);
      toast.error(error.message || "Failed to reject mediated transfer.");
    }
  };

  const handleExecuteTransfer = async (proposal: MediatedTransferProposal) => {
    if (!signer) {
      toast.error("Wallet not connected.");
      return;
    }
    try {
      const result = await executeTransfer(signer, proposal.propertyId);
      toast.success(result.message);
      loadMediatedTransferProposals(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to execute mediated transfer:", error);
      toast.error(error.message || "Failed to execute mediated transfer.");
    }
  };

  const openDetailsDialog = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setIsDetailsDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedPropertyId(null);
  };

  const allPendingItems = [
    ...requests.filter((r:any) => r.status === "pending").map(req => ({ ...req, type: "tokenization" })),
    ...mediatedTransferProposals.filter(p => p.status === "pending" || p.status === "approved").map(prop => ({ ...prop, type: "mediatedTransfer" })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (allPendingItems.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardContent className="pt-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No pending requests or mediated transfers</p>
          <p className="text-sm text-slate-500 mt-1">All items have been processed</p>
        </CardContent>
      </Card>
    );
  }

  const selectedBuildingForDialog = selectedPropertyId ? buildings.find((b:any) => b.id === `bld-${selectedPropertyId.toString().padStart(3, '0')}`) : null;

  return (
    <>
      <div className="space-y-4">
        {allPendingItems.map((item: any) => {
          if (item.type === "tokenization") {
            const request = item;
            const building = getRequestedBuilding(request.buildingAssetId);

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
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Tokenization Request</Badge>
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
            );
          } else if (item.type === "mediatedTransfer") {
            const proposal = item as MediatedTransferProposal;
            const building = buildings.find((b:any) => b.id === `bld-${proposal.propertyId.toString().padStart(3, '0')}`);
            const isCurrentUserOwner = building?.fractionalOwnership?.some((owner:any) => owner.address.toLowerCase() === user?.address?.toLowerCase());
            const hasCurrentUserApproved = proposal.ownerApprovals[user?.address?.toLowerCase() || ""] || false;
            const allOwnersApproved = Object.values(proposal.ownerApprovals).every(Boolean);

            return (
              <Card
                key={proposal.id}
                className="border-slate-700 bg-slate-800/50 backdrop-blur-lg hover:border-slate-600 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white">Mediated Transfer for {building?.name || `Property ID: ${proposal.propertyId}`}</CardTitle>
                      <CardDescription className="text-slate-400 mt-1">
                        Mediator:{" "}
                        <span className="font-mono text-slate-500">{proposal.mediator.slice(0, 10)}...</span>
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Mediated Transfer</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Proposal ID</p>
                        <p className="font-mono text-slate-300 text-xs truncate">{proposal.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Property ID</p>
                        <p className="text-slate-300">{proposal.propertyId}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Proposed</p>
                        <p className="text-slate-300">{new Date(proposal.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                      <p className="text-blue-400 font-semibold mb-2">Proposed New Owners:</p>
                      <ul className="text-slate-400 space-y-1 text-xs">
                        {proposal.nextOwners.map((owner, index) => (
                          <li key={index}>{owner.slice(0, 10)}...{owner.slice(-6)}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                      <p className="text-blue-400 font-semibold mb-2">Owner Approvals:</p>
                      <ul className="text-slate-400 space-y-1 text-xs">
                        {building?.fractionalOwnership?.map((owner:any, index:number) => (
                          <li key={index}>
                            {owner.address.slice(0, 10)}...{owner.address.slice(-6)}:{" "}
                            {proposal.ownerApprovals[owner.address.toLowerCase()] ? (
                              <span className="text-green-400">Approved</span>
                            ) : (
                              <span className="text-red-400">Pending</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-700">
                      <Button
                        onClick={() => openDetailsDialog(proposal.propertyId)}
                        variant="outline"
                        className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        View Details
                      </Button>

                      {isCurrentUserOwner && !hasCurrentUserApproved && (
                        <Button
                          onClick={() => handleOwnerApproveTransfer(proposal)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve (Owner)
                        </Button>
                      )}

                      {isCurrentUserOwner && !hasCurrentUserApproved && (
                        <Button
                          onClick={() => handleOwnerRejectTransfer(proposal)}
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject (Owner)
                        </Button>
                      )}

                      {!isCurrentUserOwner && user?.address?.toLowerCase() === proposal.mediator.toLowerCase() && allOwnersApproved && !proposal.isApprovedByMediator && (
                        <Button
                          onClick={() => handleMediatorApproveTransfer(proposal)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve (Mediator)
                        </Button>
                      )}

                      {!isCurrentUserOwner && user?.address?.toLowerCase() === proposal.mediator.toLowerCase() && allOwnersApproved && !proposal.isApprovedByMediator && (
                        <Button
                          onClick={() => handleMediatorRejectTransfer(proposal)}
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject (Mediator)
                        </Button>
                      )}

                      {allOwnersApproved && proposal.isApprovedByMediator && !proposal.isExecuted && (
                        <Button
                          onClick={() => handleExecuteTransfer(proposal)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Execute Transfer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
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

      <PropertyDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={closeDetailsDialog}
        propertyId={selectedPropertyId}
        building={selectedBuildingForDialog}
      />
    </>
  );
}