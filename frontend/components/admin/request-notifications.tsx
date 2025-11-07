"use client";

import { useEffect, useState } from "react";
import { requestService, Request } from "@/lib/request-service";
import { toast } from "sonner";

export default function RequestNotifications() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      // In a real app, you'd fetch all requests here
      const allRequests = await requestService.getRequestsForProperty(1); // Example for property 1
      setRequests(allRequests);
    };
    fetchRequests();

    const interval = setInterval(async () => {
      const allRequests = await requestService.getRequestsForProperty(1); // Example for property 1
      if (allRequests.length > requests.length) {
        const newRequest = allRequests[allRequests.length - 1];
        toast.info(`New request from ${newRequest.requester}`);
      }
      setRequests(allRequests);
    }, 5000);

    return () => clearInterval(interval);
  }, [requests]);

  return null;
}
