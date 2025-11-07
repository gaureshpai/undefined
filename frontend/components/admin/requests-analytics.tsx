"use client";

import { useEffect, useState } from "react";
import { requestService, Request } from "@/lib/request-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestsAnalytics() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      // In a real app, you'd fetch all requests here
      const allRequests = await requestService.getAllRequests();
      setRequests(allRequests);
    };
    fetchRequests();
  }, []);

  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "Pending").length;
  const approvedRequests = requests.filter((r) => r.status === "Approved").length;
  const rejectedRequests = requests.filter((r) => r.status === "Rejected").length;

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg mt-6">
      <CardHeader>
        <CardTitle className="text-white">Requests Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-white">{totalRequests}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingRequests}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-400">{approvedRequests}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{rejectedRequests}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
