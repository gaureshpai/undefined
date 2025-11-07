"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { blockchainService } from "@/lib/blockchain-service";
import { PropertyDetails, FractionalNFTDetails } from "@/lib/contract-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Link as LinkIcon, Building2, DollarSign, Layers, Scale } from "lucide-react";
import Link from "next/link";
import { ethers, Interface, Log } from "ethers";
import { CONTRACT_CONFIG } from "@/lib/contract-config";

interface TransactionLog {
  blockNumber: number;
  address: string;
  event: string;
  args: any;
  txHash: string;
}

export default function MarketplaceDetailPage() {
  const params = useParams();
  const propertyId = Number(params.id);

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [fractionalNFT, setFractionalNFT] = useState<FractionalNFTDetails | null>(null);
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await blockchainService.initialize();

        // Fetch property details
        const propertyDetails = await blockchainService.getProperty(propertyId);
        if (!propertyDetails) {
          throw new Error("Property not found.");
        }
        setProperty(propertyDetails);

        // Fetch fractional NFT details
        const fractionalNFTDetails = await blockchainService.getFractionalNFTDetails(propertyId);
        setFractionalNFT(fractionalNFTDetails);

        // Fetch transaction history for this property
        const prAddr = CONTRACT_CONFIG.propertyRegistry.address.toLowerCase();
        const fracAddr = fractionalNFTDetails?.address.toLowerCase();

        const provider = new ethers.JsonRpcProvider(
          (await import("@/lib/contract-config")).getRpcUrl()
        );
        const latest = await provider.getBlockNumber();
        const fromBlock = Math.max(0, latest - 5000); // Look back 5000 blocks

        const prIface = new Interface(CONTRACT_CONFIG.propertyRegistry.abi);
        const fracIface = fractionalNFTDetails ? new Interface(CONTRACT_CONFIG.fractionalNFT.abi) : null;

        const filters = [];
        // Filter for PropertyRegistry events related to this property
        filters.push({
          address: prAddr,
          topics: [
            ethers.id("PropertyRegistered(uint256,string,address)"),
            ethers.zeroPadValue(ethers.toBeHex(propertyId), 32)
          ],
          fromBlock,
          toBlock: latest
        });
        filters.push({
          address: prAddr,
          topics: [
            ethers.id("PropertyFractionalized(uint256,address)"),
            ethers.zeroPadValue(ethers.toBeHex(propertyId), 32)
          ],
          fromBlock,
          toBlock: latest
        });
        filters.push({
          address: prAddr,
          topics: [
            ethers.id("NFTListedForSale(uint256,uint256,address,address,uint256,uint256)"),
            null, // Any listingId
            ethers.zeroPadValue(ethers.toBeHex(propertyId), 32) // Filter by propertyId
          ],
          fromBlock,
          toBlock: latest
        });
        filters.push({
          address: prAddr,
          topics: [
            ethers.id("NFTPurchased(uint256,uint256,address,uint256,uint256)"),
            null, // Any listingId
            ethers.zeroPadValue(ethers.toBeHex(propertyId), 32) // Filter by propertyId
          ],
          fromBlock,
          toBlock: latest
        });
        filters.push({
          address: prAddr,
          topics: [
            ethers.id("PropertyRequestApproved(uint256,uint256)"),
            null, // Any requestId
            ethers.zeroPadValue(ethers.toBeHex(propertyId), 32) // Filter by propertyId
          ],
          fromBlock,
          toBlock: latest
        });

        // Filter for FractionalNFT events related to this property's fractional contract
        if (fracAddr) {
          filters.push({
            address: fracAddr,
            topics: [
              ethers.id("Transfer(address,address,uint256)"), // ERC-1155 TransferSingle or ERC-20 Transfer
            ],
            fromBlock,
            toBlock: latest
          });
        }

        const allLogs = await Promise.all(filters.map(filter => provider.getLogs(filter as any)));
        const combinedLogs = allLogs.flat();

        const parsedLogs = combinedLogs
          .map((log: Log) => {
            try {
              let event: ethers.LogDescription | null = null;
              let iface: Interface | null = null;

              if (log.address.toLowerCase() === prAddr) {
                iface = prIface;
              } else if (fracAddr && log.address.toLowerCase() === fracAddr) {
                iface = fracIface;
              }

              if (iface) {
                event = iface.parseLog(log);
              }
              
              if (event) {
                return {
                  blockNumber: log.blockNumber,
                  address: log.address,
                  event: event.name,
                  args: event.args,
                  txHash: log.transactionHash,
                };
              }
              return null;
            } catch (e) {
              // console.warn("Failed to parse log:", e);
              return null;
            }
          })
          .filter(Boolean) as TransactionLog[];

        // Deduplicate transactions by txHash and sort by block number
        const uniqueTransactions = Array.from(new Map(parsedLogs.map(tx => [tx.txHash, tx])).values())
          .sort((a, b) => b.blockNumber - a.blockNumber);

        setTransactions(uniqueTransactions);

      } catch (err: any) {
        console.error("Failed to fetch property details or transactions:", err);
        setError(err.message || "Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[40vh] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found!</AlertTitle>
          <AlertDescription>The requested property could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">{property.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative w-full" style={{ minHeight: '40vh' }}>
            {property.imageUrl ? (
              <img
                src={property.imageUrl}
                alt={property.name}
                className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg text-muted-foreground">
                No Image Available
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2"><Building2 className="h-4 w-4" /> ID: {property.id}</p>
                <p className="flex items-center gap-2"><Scale className="h-4 w-4" /> Owner: {property.owner}</p>
                {fractionalNFT && (
                  <>
                    <p className="flex items-center gap-2"><Layers className="h-4 w-4" /> Fractional NFT Address: <Link href={`https://etherscan.io/address/${fractionalNFT.address}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{fractionalNFT.address}</Link></p>
                    <p className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Total Supply: {fractionalNFT.totalSupply}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Deeds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={property.partnershipAgreementUrl} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-4 w-4 mr-2" /> Partnership Agreement
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={property.maintenanceAgreementUrl} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-4 w-4 mr-2" /> Maintenance Agreement
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={property.rentAgreementUrl} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-4 w-4 mr-2" /> Rent Agreement
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No relevant transactions found for this property.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{tx.event}</CardTitle>
                  <CardDescription>Block: {tx.blockNumber} | Tx Hash: <Link href={`https://etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{tx.txHash}</Link></CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground font-mono break-all">
                  <p>Contract: {tx.address}</p>
                  <p>Args: {JSON.stringify(tx.args, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                  )}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
