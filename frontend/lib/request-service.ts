import { blockchainService } from "./blockchain-service";

export interface Request {
  id: number;
  propertyId: number;
  requester: string;
  requestType: string;
  details: string;
  status: "Pending" | "Approved" | "Rejected";
}

class RequestService {
  private requests: Request[] = [];
  private nextRequestId = 1;

  async createRequest(
    propertyId: number,
    requester: string,
    requestType: string,
    details: string
  ): Promise<Request> {
    const newRequest: Request = {
      id: this.nextRequestId++,
      propertyId,
      requester,
      requestType,
      details,
      status: "Pending",
    };

    this.requests.push(newRequest);
    return newRequest;
  }

  async getRequestsForProperty(propertyId: number): Promise<Request[]> {
    return this.requests.filter((req) => req.propertyId === propertyId);
  }

  async getAllRequests(): Promise<Request[]> {
    return this.requests;
  }

  async getRequest(requestId: number): Promise<Request | undefined> {
    return this.requests.find((req) => req.id === requestId);
  }

  async updateRequestStatus(
    requestId: number,
    status: "Approved" | "Rejected"
  ): Promise<Request | undefined> {
    const request = await this.getRequest(requestId);
    if (request) {
      request.status = status;
      return request;
    }
    return undefined;
  }
}

export const requestService = new RequestService();
