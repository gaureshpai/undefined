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

export interface CreatePropertyRequestParams {
  name: string;
  partnershipAgreementUrl: string;
  maintenanceAgreementUrl: string;
  rentAgreementUrl: string;
  imageUrl: string;
  ownerAddresses: string[];
  percentages: number[];
}

export interface Owner {
  ownerAddress: string;
  percentage: number;
}

export enum PropertyRequestStatus {
  Pending,
  Approved,
  Rejected,
}

export interface PropertyRequest {
  id: number;
  name: string;
  partnershipAgreementUrl: string;
  maintenanceAgreementUrl: string;
  rentAgreementUrl: string;
  imageUrl: string;
  requester: string;
  owners: Owner[];
  status: PropertyRequestStatus;
  propertyId: number;
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

export enum ListingStatus {
  Active,
  Cancelled,
  Sold,
}

export interface Listing {
  listingId: number;
  propertyId: number;
  fractionalNFTAddress: string;
  seller: string;
  amount: number;
  pricePerShare: number;
  status: ListingStatus;
}

export interface MarketplaceListing extends Listing {
  propertyName: string;
  imageUrl: string;
}
