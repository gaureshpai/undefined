"use client";

import { useEffect, useState, useMemo } from "react";
import { blockchainService } from "@/lib/blockchain-service";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Listing, ListingStatus, MarketplaceListing } from "@/lib/contract-types";
import { ethers } from "ethers";

import { Skeleton } from "@/components/ui/skeleton";

import Link from "next/link";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amountToBuy, setAmountToBuy] = useState<{ [key: number]: number }>({});
  const [isBuying, setIsBuying] = useState<{ [key: number]: boolean }>({});

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      await blockchainService.initialize();
      const activeListings = await blockchainService.getAllActiveListings();
      
      const listingsWithPropertyDetails = await Promise.all(activeListings.map(async (listing: Listing) => {
        const property = await blockchainService.getProperty(listing.propertyId);
        return {
          ...listing,
          propertyName: property?.name || `Property ${listing.propertyId}`,
          imageUrl: property?.imageUrl || "",
        };
      }));
      setListings(listingsWithPropertyDetails);
    } catch (e: any) {
      console.error("Failed to load marketplace listings:", e);
      setError(e.message || "Failed to load marketplace listings.");
      toast.error(e.message || "Failed to load marketplace listings.");
    } finally {
      setLoading(false);
    }
  };
 
  const displayListings = useMemo(() => {
    const grouped = new Map<string, MarketplaceListing & { originalListingIds: number[] }>();

    listings.forEach(listing => {
      const key = `${listing.propertyId}-${listing.pricePerShare}`;
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.amount += listing.amount;
        existing.originalListingIds.push(listing.listingId);
      } else {
        grouped.set(key, { ...listing, originalListingIds: [listing.listingId] });
      }
    });

    return Array.from(grouped.values());
  }, [listings]);

  useEffect(() => {
    fetchListings();
  }, []);

  const handleBuy = async (e: React.MouseEvent, listing: MarketplaceListing) => {
    e.stopPropagation(); // Prevent navigation
    const buyAmount = amountToBuy[listing.listingId] || 0;
    if (buyAmount <= 0 || buyAmount > listing.amount) {
      toast.error(`Please enter a valid amount to buy (1-${listing.amount}).`);
      return;
    }

    setIsBuying((prev) => ({ ...prev, [listing.listingId]: true }));
    setError(null);

    try {
      const totalPrice = (buyAmount * listing.pricePerShare);
      await blockchainService.buyListedFractionalNFT(
        listing.listingId,
        buyAmount,
        totalPrice
      );
      toast.success(`Successfully purchased ${buyAmount} shares of ${listing.propertyName}!`);
      setAmountToBuy((prev) => ({ ...prev, [listing.listingId]: 0 })); // Clear input
      fetchListings(); // Re-fetch listings to update UI
    } catch (err: any) {
      console.error("Failed to buy NFT:", err);
      setError(err.message || "Failed to buy NFT.");
      toast.error(err.message || "Failed to buy NFT.");
    } finally {
      setIsBuying((prev) => ({ ...prev, [listing.listingId]: false }));
    }
  };

  const handleAmountToBuyChange = (e: React.ChangeEvent<HTMLInputElement>, listingId: number) => {
    e.stopPropagation(); // Prevent navigation
    setAmountToBuy((prev) => ({
      ...prev,
      [listingId]: Number(e.target.value),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-56 mb-2" />
                  <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-9 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-destructive flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground text-sm">Browse fractional tokens of approved properties</p>
        </div>

        {displayListings.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground">No active listings found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayListings.map((listing) => (
              <Link key={listing.listingId} href={`/marketplace/${listing.propertyId}`} className="block">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="flex-row items-center gap-4">
                    {listing.imageUrl && (
                      <img src={listing.imageUrl} alt={listing.propertyName} className="w-16 h-16 object-cover rounded-md" />
                    )}
                    <div className="flex-1">
                      <CardTitle>{listing.propertyName}</CardTitle>
                      <CardDescription>
                        Listed by: {listing.seller}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground">
                      Amount: {listing.amount} shares
                    </p>
                    <p className="text-sm text-foreground">
                      Price per share: {listing.pricePerShare} ETH
                    </p>
                    <p className="text-sm text-muted-foreground font-mono break-all mt-2">
                      Fractional NFT: {listing.fractionalNFTAddress}
                    </p>

                    {user.isConnected ? (
                      listing.seller.toLowerCase() !== user.address?.toLowerCase() ? (
                        <div className="mt-4 space-y-2">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor={`amount-to-buy-${listing.listingId}`} className="text-right text-foreground">
                              Buy Amount
                            </Label>
                            <Input
                              id={`amount-to-buy-${listing.listingId}`}
                              type="number"
                              placeholder={`1-${listing.amount}`}
                              value={amountToBuy[listing.listingId] || ""}
                              onChange={(e) => handleAmountToBuyChange(e, listing.listingId)}
                              onClick={(e) => e.stopPropagation()} // Prevent Link navigation
                              min="1"
                              max={listing.amount}
                            />
                          </div>
                          <Button
                            onClick={(e) => handleBuy(e, listing)}
                            disabled={isBuying[listing.listingId]}
                            className="w-full"
                          >
                            {isBuying[listing.listingId] ? "Buying..." : "Buy Shares"}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-4">You own this listing.</p>
                      )
                    ) : (
                      <p className="text-xs text-muted-foreground mt-4">Connect/sign in to buy</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
