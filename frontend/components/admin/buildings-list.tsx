import { useState, useEffect } from "react";
import { blockchainService } from "@/lib/blockchain-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FractionalizeNftForm from "./fractionalize-nft-form";
import EnhancedRequestsList from "./enhanced-requests-list";

// ... (imports)

export default function BuildingsList() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [showRequests, setShowRequests] = useState<number | null>(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        await blockchainService.initialize();
        const allBuildings = await blockchainService.getAllProperties();
        setBuildings(allBuildings);
      } catch (err: any) {
        setError(err.message || "Failed to fetch buildings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  const handleFractionalizeClick = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
  };

  const handleShowRequestsClick = (propertyId: number) => {
    setShowRequests(showRequests === propertyId ? null : propertyId);
  };

  if (isLoading) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardContent className="pt-12 text-center">
          <p className="text-slate-400">Loading buildings...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardContent className="pt-12 text-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (buildings.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
        <CardContent className="pt-12 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No buildings created yet</p>
          <p className="text-sm text-slate-500 mt-1">Create your first tokenized asset</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {buildings.map((building: any) => (
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
                  Token ID: {building.id}
                </CardDescription>
              </div>
              <Badge
                variant="default"
                className="bg-green-500/20 text-green-400 border-green-500/30"
              >
                NFT Property
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Owner</p>
                <p className="text-sm font-mono text-slate-300 truncate">{building.owner.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Partnership Agreement</p>
                <a href={building.partnershipAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">View Document</a>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Maintenance Agreement</p>
                <a href={building.maintenanceAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">View Document</a>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Rent Agreement</p>
                <a href={building.rentAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">View Document</a>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button onClick={() => handleFractionalizeClick(building.id)} className="bg-purple-600 hover:bg-purple-700 text-white">
                Fractionalize NFT
              </Button>
              <Button onClick={() => handleShowRequestsClick(building.id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                {showRequests === building.id ? "Hide" : "Show"} Requests
              </Button>
            </div>
            {selectedPropertyId === building.id && (
              <FractionalizeNftForm propertyId={selectedPropertyId|| 0} />
            )}
            {showRequests === building.id && (
              <EnhancedRequestsList propertyId={building.id} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}