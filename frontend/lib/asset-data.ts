// Mock data structure for assets and tokens
export interface BuildingAsset {
  id: string
  name: string
  location: string
  owner: string
  tokenId: string
  files: {
    partnershipAgreement?: string
    maintenanceAgreement?: string
    rentAgreement?: string
  }
  createdAt: string
  status: "approved" | "pending" | "rejected"
  fractionalOwnership?: Array<{
    address: string
    percentage: number
  }>
}

export interface TokenRequest {
  id: string
  buildingAssetId: string
  requestedBy: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

// Mock data store (in production, use a database)
export const mockBuildings: BuildingAsset[] = [
  {
    id: "bld-001",
    name: "Downtown Office Complex",
    location: "Manhattan, NY",
    owner: "0x1234567890123456789012345678901234567890",
    tokenId: "TOKEN-001",
    files: {
      partnershipAgreement: "partnership-001.pdf",
      maintenanceAgreement: "maintenance-001.pdf",
      rentAgreement: "rent-001.pdf",
    },
    createdAt: new Date("2024-01-15").toISOString(),
    status: "approved",
    fractionalOwnership: [
      { address: "0x1234567890123456789012345678901234567890", percentage: 60 },
      { address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", percentage: 40 },
    ],
  },
]

export const mockRequests: TokenRequest[] = [
  {
    id: "req-001",
    buildingAssetId: "bld-001",
    requestedBy: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
]
