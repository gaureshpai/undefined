"use client";

import { useEffect, useState } from "react";
import { blockchainService } from "@/lib/blockchain-service";
import { PropertyRequest, PropertyRequestStatus, Owner } from "@/lib/contract-types";
import { CONTRACT_CONFIG } from "@/lib/contract-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function EnhancedRequestsList({ propertyId }: { propertyId: number }) {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const count = await blockchainService.requestCount();
      const allFetchedRequests: PropertyRequest[] = [];
      for (let i = 1; i <= count; i++) {
        const req = await blockchainService.getRequest(i);
        if (req) {
          const [ownerAddresses, percentages] = await blockchainService.getRequestOwners(i);
          const owners: Owner[] = ownerAddresses.map((addr, idx) => ({
            ownerAddress: addr,
            percentage: Number(percentages[idx]),
          }));
          allFetchedRequests.push({
            ...req,
            owners: owners,
            status: req.status as PropertyRequestStatus,
          });
        }
      }
      // Filter requests by propertyId
      const filteredRequests = allFetchedRequests.filter(
        (req) => req.propertyId === propertyId
      );
      setRequests(filteredRequests);
    } catch (err: any) {
      console.error("Failed to fetch requests:", err);
      setError(err.message || "Failed to fetch requests.");
      toast.error(err.message || "Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [propertyId]);

  const handleApprove = async (requestId: number) => {
    try {
      await blockchainService.approveRequest(requestId);
      toast.success(`Request #${requestId} approved and NFT fractionalized successfully!`);
      fetchRequests(); // Re-fetch requests to update status
    } catch (err: any) {
      console.error("Failed to approve request:", err);
      toast.error(err.message || `Failed to approve request #${requestId}.`);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await blockchainService.rejectRequest(requestId);
      toast.success(`Request #${requestId} rejected successfully!`);
      fetchRequests(); // Re-fetch requests to update status
    } catch (err: any) {
      console.error("Failed to reject request:", err);
      toast.error(err.message || `Failed to reject request #${requestId}.`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-6 w-20" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (requests.length === 0) {
    return <p className="text-muted-foreground mt-6">No requests for this property.</p>;
  }

  return (
    <div className="space-y-4 mt-6">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <CardTitle>Request #{request.id} - {request.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Requester: {request.requester}</p>
            <p className="text-muted-foreground">Image URL: <a href={request.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Image</a></p>
            <p className="text-muted-foreground">Partnership Agreement: <a href={request.partnershipAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Document</a></p>
            <p className="text-muted-foreground">Maintenance Agreement: <a href={request.maintenanceAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Document</a></p>
            <p className="text-muted-foreground">Rent Agreement: <a href={request.rentAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Document</a></p>
            <div className="mt-2">
              <h4 className="text-foreground font-semibold">Owners:</h4>
              {request.owners.map((owner, idx) => (
                <p key={idx} className="text-muted-foreground text-sm ml-2">- {owner.ownerAddress}: {owner.percentage / 100}%</p>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <Badge
                variant={request.status === PropertyRequestStatus.Pending ? "default" : request.status === PropertyRequestStatus.Approved ? "secondary" : "destructive"}
              >
                {PropertyRequestStatus[request.status]}
              </Badge>
              {request.status === PropertyRequestStatus.Pending && (
                <div className="space-x-2">
                  <Button onClick={() => handleApprove(request.id)} size="sm">
                    Approve
                  </Button>
                  <Button onClick={() => handleReject(request.id)} size="sm" variant="destructive">
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
