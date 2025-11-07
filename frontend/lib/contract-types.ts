// TypeScript types for PropertyRegistry contract

export interface PropertyOwner {
  wallet: string;
  percentage: number;
}

export interface PropertyData {
  id: number;
  name: string;
  ownersCount: number;
}

export interface PropertyDetails {
  id: number;
  name: string;
  owners: PropertyOwner[];
}

// Event types
export interface PropertyRegisteredEvent {
  propertyId: bigint;
  name: string;
}

export interface ShareTransferredEvent {
  propertyId: bigint;
  from: string;
  to: string;
  percent: bigint;
}

export interface PropertyFullyTransferredEvent {
  propertyId: bigint;
  from: string;
  to: string;
}

// Contract method parameters
export interface RegisterPropertyParams {
  name: string;
  owners: string[];
  shares: number[];
}

export interface TransferShareParams {
  propertyId: number;
  to: string;
  percent: number;
}

export interface TransferFullOwnershipParams {
  propertyId: number;
  to: string;
}

export interface InitiateMediatedTransferParams {
  propertyId: number;
  to: string;
  from: string;
}
