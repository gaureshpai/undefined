/**
 * Request Service - Handles tokenization requests and approvals
 */

import type { TokenRequest, BuildingAsset } from "./asset-data"

export interface RequestAction {
  type: "approve" | "reject"
  requestId: string
  reason?: string
  timestamp: string
}

export interface RequestAnalytics {
  totalRequests: number
  approved: number
  rejected: number
  pending: number
  approvalRate: number
}

class RequestService {
  private requestHistory: RequestAction[] = []

  /**
   * Create a new tokenization request
   */
  createRequest(buildingAssetId: string, requestedBy: string): TokenRequest {
    return {
      id: `req-${Date.now()}`,
      buildingAssetId,
      requestedBy,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * Approve a tokenization request
   */
  approveRequest(
    request: TokenRequest,
    building: BuildingAsset,
  ): { success: boolean; message: string; building: BuildingAsset } {
    this.requestHistory.push({
      type: "approve",
      requestId: request.id,
      timestamp: new Date().toISOString(),
    })

    const updatedBuilding = {
      ...building,
      status: "approved" as const,
    }

    return {
      success: true,
      message: `Building "${building.name}" has been approved and tokenized successfully`,
      building: updatedBuilding,
    }
  }

  /**
   * Reject a tokenization request
   */
  rejectRequest(
    request: TokenRequest,
    building: BuildingAsset,
    reason?: string,
  ): { success: boolean; message: string } {
    this.requestHistory.push({
      type: "reject",
      requestId: request.id,
      reason,
      timestamp: new Date().toISOString(),
    })

    return {
      success: true,
      message: `Request for "${building.name}" has been rejected${reason ? ` - ${reason}` : ""}`,
    }
  }

  /**
   * Get request analytics
   */
  getAnalytics(requests: TokenRequest[]): RequestAnalytics {
    const approved = requests.filter((r) => r.status === "approved").length
    const rejected = requests.filter((r) => r.status === "rejected").length
    const pending = requests.filter((r) => r.status === "pending").length
    const totalRequests = requests.length

    return {
      totalRequests,
      approved,
      rejected,
      pending,
      approvalRate: totalRequests > 0 ? Math.round((approved / totalRequests) * 100) : 0,
    }
  }

  /**
   * Get request history
   */
  getRequestHistory(): RequestAction[] {
    return this.requestHistory
  }

  /**
   * Validate request data
   */
  validateRequest(building: BuildingAsset): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!building.name || building.name.trim() === "") {
      errors.push("Building name is required")
    }

    if (!building.location || building.location.trim() === "") {
      errors.push("Building location is required")
    }

    if (!building.owner || building.owner.trim() === "") {
      errors.push("Owner address is required")
    }

    if (!building.files.partnershipAgreement) {
      errors.push("Partnership agreement is required")
    }

    if (!building.files.maintenanceAgreement) {
      errors.push("Maintenance agreement is required")
    }

    if (!building.files.rentAgreement) {
      errors.push("Rent agreement is required")
    }

    if (!building.fractionalOwnership || building.fractionalOwnership.length === 0) {
      errors.push("At least one owner must be specified")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export const requestService = new RequestService()
