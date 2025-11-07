"use client";

import { useEffect, useState } from "react";
import { CONTRACT_CONFIG } from "@/lib/contract-config";
import { ethers, Interface, Log } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const provider = new ethers.JsonRpcProvider((await import("@/lib/contract-config")).getRpcUrl());
        const latest = await provider.getBlockNumber();
        const fromBlock = Math.max(0, latest - 2000);

        const prAddr = CONTRACT_CONFIG.propertyRegistry.address.toLowerCase();
        const fracAddr = CONTRACT_CONFIG.fractionalizer.address.toLowerCase();

        const prIface = new Interface(CONTRACT_CONFIG.propertyRegistry.abi);
        const fracIface = new Interface(CONTRACT_CONFIG.fractionalizer.abi);

        const prFilter = { address: prAddr, fromBlock, toBlock: latest };
        const frFilter = { address: fracAddr, fromBlock, toBlock: latest };
        const [prLogs, frLogs] = await Promise.all([
          provider.getLogs(prFilter as any),
          provider.getLogs(frFilter as any),
        ]);

        const parsed = [...prLogs, ...frLogs]
          .map((lg: Log) => {
            try {
              const iface = lg.address.toLowerCase() === prAddr ? prIface : fracIface;
              const ev = iface.parseLog(lg);
              return {
                blockNumber: lg.blockNumber,
                address: lg.address,
                event: ev?.name,
                args: ev?.args,
                txHash: lg.transactionHash,
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .sort((a: any, b: any) => b.blockNumber - a.blockNumber);

        setLogs(parsed as any[]);
      } catch (e: any) {
        setError(e.message || "Failed to load transaction history");
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
        <p className="text-muted-foreground text-sm">Recent events from PropertyRegistry and Fractionalizer</p>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-muted-foreground">No recent events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((l, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{l.event}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground font-mono break-all">
                  <div>Block: {l.blockNumber}</div>
                  <div>Address: {l.address}</div>
                  <div>Tx: {l.txHash}</div>
                  <div>Args: {JSON.stringify(l.args, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
