import { useState, useEffect, useCallback } from "react";
import { blockchainService } from "@/lib/blockchain-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-5 w-48 rounded" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-4 w-64 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
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
      <Card>
        <CardContent className="pt-12 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (buildings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No buildings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {buildings.map((b: any) => (
        <Card key={b.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {b.name} <span className="text-xs text-muted-foreground">(ID: {b.id})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Owner</p>
                <p className="text-sm font-mono text-foreground break-all">{b.owner}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="pt-2">
        <Button onClick={handleLoadMore} variant="outline">
          Load more
        </Button>
      </div>
    </div>
  );
}
