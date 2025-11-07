"use client";

import { useEffect, useState } from "react";
import { blockchainService } from "@/lib/blockchain-service";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssetTransferModal from "@/components/user/asset-transfer-modal";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        await blockchainService.initialize();
        const properties = await blockchainService.getAllProperties();
        const results = await Promise.all(properties.map(async (p) => {
          const details = await blockchainService.getFractionalNFTDetails(p.id);
          if (!details) return null;
          let balance = 0;
          if (user.address) {
            const { Contract } = await import("ethers");
            const { CONTRACT_CONFIG } = await import("@/lib/contract-config");
            const provider = (blockchainService as any).provider;
            const contract = new Contract(String(details.address).toLowerCase(), CONTRACT_CONFIG.fractionalNFT.abi, provider);
            const providerBalance = await contract.balanceOf(user.address);
            balance = Number(providerBalance);
          }
          return {
            propertyId: p.id,
            propertyName: p.name,
            fractionalNFTAddress: details.address,
            fractionalNFTName: details.name,
            fractionalNFTSymbol: details.symbol,
            totalSupply: details.totalSupply,
            balance,
            percentage: details.totalSupply ? (balance / details.totalSupply) * 100 : 0,
          } as any;
        }));
        setItems(results.filter(Boolean) as any[]);
      } catch (e: any) {
        setError(e.message || "Failed to load marketplace");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-300 flex items-center justify-center">
        Loading marketplace...
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

        {items.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
            <CardContent className="pt-12 text-center">
              <p className="text-slate-400">No fractionalized assets yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((it, idx) => (
              <Card key={idx} className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">{it.propertyName}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {it.fractionalNFTName} ({it.fractionalNFTSymbol}) — Supply: {it.totalSupply}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-300 font-mono break-all">
                    Token: {it.fractionalNFTAddress}
                  </div>
                  {user.isConnected ? (
                    it.balance > 0 ? (
                      <div className="mt-4">
                        <p className="text-xs text-slate-400 mb-2">You own {it.balance} ({it.percentage.toFixed(2)}%)</p>
                        <AssetTransferModal ownedNFT={it} />
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Button disabled variant="outline" className="border-slate-600 text-slate-400">
                          Buy (coming soon)
                        </Button>
                      </div>
                    )
                  ) : (
                    <p className="text-xs text-slate-500 mt-4">Connect/sign in to trade</p>
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
