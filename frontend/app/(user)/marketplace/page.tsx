"use client";

import { useEffect, useState } from "react";
import { blockchainService } from "@/lib/blockchain-service";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Listing, ListingStatus, MarketplaceListing } from "@/lib/contract-types";
import { ethers } from "ethers";

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

  useEffect(() => {
    fetchListings();
  }, []);

  const handleBuy = async (listing: MarketplaceListing) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="h-8 w-48 rounded bg-slate-700/60" />
            <div className="mt-2 h-4 w-64 rounded bg-slate-800/60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-slate-700 bg-slate-800/50 backdrop-blur-lg rounded-lg p-6">
                <div className="h-6 w-56 rounded bg-slate-700/60 mb-2" />
                <div className="h-4 w-80 rounded bg-slate-700/60 mb-4" />
                <div className="h-4 w-full rounded bg-slate-700/60" />
                <div className="mt-4 h-9 w-28 rounded bg-slate-700/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-slate-400 text-sm">Browse fractional tokens of approved properties</p>
        </div>

        {listings.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
            <CardContent className="pt-12 text-center">
              <p className="text-slate-400">No active listings found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <Card key={listing.listingId} className="border-slate-700 bg-slate-800/60 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">{listing.propertyName}</CardTitle>
                  <CardDescription className="text-slate-400">
                    Listed by: {listing.seller}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    Amount: {listing.amount} shares
                  </p>
                  <p className="text-sm text-slate-300">
                    Price per share: {listing.pricePerShare} ETH
                  </p>
                  <p className="text-sm text-slate-300 font-mono break-all mt-2">
                    Fractional NFT: {listing.fractionalNFTAddress}
                  </p>

                  {user.isConnected ? (
                    listing.seller.toLowerCase() !== user.address?.toLowerCase() ? (
                      <div className="mt-4 space-y-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor={`amount-to-buy-${listing.listingId}`} className="text-right text-slate-300">
                            Buy Amount
                          </Label>
                          <Input
                            id={`amount-to-buy-${listing.listingId}`}
                            type="number"
                            value={amountToBuy[listing.listingId] || ""}
                            onChange={(e) =>
                              setAmountToBuy((prev) => ({
                                ...prev,
                                [listing.listingId]: Number(e.target.value),
                              }))
                            }
                            className="col-span-2 bg-slate-700/50 border-slate-600 text-white"
                            min="1"
                            max={listing.amount}
                          />
                        </div>
                        <Button
                          onClick={() => handleBuy(listing)}
                          disabled={isBuying[listing.listingId]}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isBuying[listing.listingId] ? "Buying..." : "Buy Shares"}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mt-4">You own this listing.</p>
                    )
                  ) : (
                    <p className="text-xs text-slate-500 mt-4">Connect/sign in to buy</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
