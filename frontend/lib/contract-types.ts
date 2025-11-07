// TypeScript types for PropertyRegistry contract

export interface PropertyData {
  id: number;
  name: string;
  owner: string;
  partnershipAgreementUrl: string;
  maintenanceAgreementUrl: string;
  rentAgreementUrl: string;
  imageUrl: string;
}

export interface PropertyDetails {
  id: number;
  name: string;
  owner: string;
  partnershipAgreementUrl: string;
  maintenanceAgreementUrl: string;
  rentAgreementUrl: string;
  imageUrl: string;
}

// Event types
export interface PropertyRegisteredEvent {
  propertyId: bigint;
  name: string;
  owner: string;
}

// Contract method parameters
export interface RegisterPropertyParams {
  name: string;
  owner: string;
  partnershipAgreementUrl: string;
  maintenanceAgreementUrl: string;
  rentAgreementUrl: string;
  imageUrl: string;
}

export interface FractionalNFTDetails {
  address: string;
  name: string;
  symbol: string;
  totalSupply: number;
}

export interface OwnedFractionalNFT {
  propertyId: number;
  propertyName: string;
  fractionalNFTAddress: string;
  fractionalNFTName: string;
  fractionalNFTSymbol: string;
  totalSupply: number;
  balance: number;
  percentage: number;
}
