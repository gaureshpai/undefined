import { useState, useEffect, useCallback } from "react";
import { blockchainService } from "@/lib/blockchain-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BuildingsList() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const loadPage = useCallback(async (pageIndex: number) => {
    try {
      await blockchainService.initialize();
      const count = await blockchainService.getPropertyCount();
      const start = pageIndex * PAGE_SIZE + 1;
      const end = Math.min(count, start + PAGE_SIZE - 1);
      if (start > end) return [] as any[];
      const tasks: Promise<any | null>[] = [];
      for (let id = start; id <= end; id++) {
        tasks.push(blockchainService.getProperty(id));
      }
      const pageItems = (await Promise.all(tasks)).filter(Boolean);
      return pageItems;
    } catch (err: any) {
      throw err;
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const first = await loadPage(0);
        setBuildings(first);
        setPage(0);
      } catch (err: any) {
        setError(err.message || "Failed to load buildings");
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [loadPage]);

  const handleLoadMore = async () => {
    try {
      const next = page + 1;
      const pageItems = await loadPage(next);
      if (pageItems.length > 0) {
        setBuildings((prev) => [...prev, ...pageItems]);
        setPage(next);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load more");
    }
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
          <p className="text-slate-400">No buildings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {buildings.map((b: any) => (
        <Card key={b.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              {b.name} <span className="text-xs text-slate-500">(ID: {b.id})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Owner</p>
                <p className="text-sm font-mono text-slate-300 break-all">{b.owner}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="pt-2">
        <Button onClick={handleLoadMore} variant="outline" className="border-slate-700 text-slate-200">
          Load more
        </Button>
      </div>
    </div>
  );
}
