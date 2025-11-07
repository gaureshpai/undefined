import { create } from "zustand";
import {
  type BuildingAsset,
  type TokenRequest,
  mockBuildings,
  mockRequests,
} from "./asset-data";
import { blockchainService } from "./blockchain-service";
import type { PropertyDetails } from "./contract-types";
import { toast } from "sonner";
import { ethers } from "ethers";
import { MediatedTransferProposal, getMediatedTransferProposals } from "./mediated-transfer-service";

interface AssetStore {
  buildings: BuildingAsset[];
  requests: TokenRequest[];
  mediatedTransferProposals: MediatedTransferProposal[];
  isLoadingBlockchain: boolean;
  blockchainError: string | null;
  addBuilding: (building: BuildingAsset) => void;
  updateBuildingStatus: (id: string, status: "approved" | "rejected") => void;
  addRequest: (request: TokenRequest) => void;
  updateRequestStatus: (id: string, status: "approved" | "rejected") => void;
  getBuildings: () => BuildingAsset[];
  getRequests: () => TokenRequest[];
  getMediatedTransferProposals: () => MediatedTransferProposal[];
  updateMediatedTransferProposalStatus: (id: string, status: "pending" | "approved" | "rejected" | "executed") => void;
  // Blockchain methods
  loadPropertiesFromBlockchain: (userAddress?: string) => Promise<void>;
  loadMediatedTransferProposals: () => Promise<void>;
  registerPropertyOnBlockchain: (name: string, owners: string[], shares: number[]) => Promise<void>;
  transferFullOwnership: (params: { propertyId: number; to: string }) => Promise<void>;
  initiateTransferRequest: (params: { propertyId: number; to: string; from: string }) => Promise<void>;
}

// Helper to convert blockchain property to BuildingAsset
function propertyToBuilding(property: PropertyDetails, index: number): BuildingAsset {
  return {
    id: `bld-${property.id.toString().padStart(3, '0')}`,
    name: property.name,
    location: "On-chain Property", // Could be stored in property name or separate mapping
    owner: property.owners[0]?.wallet || "0x0000000000000000000000000000000000000000",
    tokenId: `TOKEN-${property.id.toString().padStart(3, '0')}`,
    files: {
      partnershipAgreement: "on-chain-metadata",
      maintenanceAgreement: "on-chain-metadata",
      rentAgreement: "on-chain-metadata",
    },
    createdAt: new Date().toISOString(),
    status: "approved" as const,
    fractionalOwnership: property.owners.map(owner => ({
      address: owner.wallet,
      percentage: owner.percentage,
    })),
  };
}

export const useAssetStore = create<AssetStore>((set: any, get: any) => ({
  buildings: mockBuildings,
  requests: mockRequests,
  mediatedTransferProposals: [],
  isLoadingBlockchain: false,
  blockchainError: null,

  addBuilding: (building: BuildingAsset) => {
    set((state: AssetStore) => ({
      buildings: [...state.buildings, building],
    }));
  },

  updateBuildingStatus: (id: string, status: "approved" | "rejected") => {
    set((state: AssetStore) => ({
      buildings: state.buildings.map((b) =>
        b.id === id ? { ...b, status } : b
      ),
    }));
  },

  addRequest: (request: TokenRequest) => {
    set((state: AssetStore) => ({
      requests: [...state.requests, request],
    }));
  },

  updateRequestStatus: (id: string, status: "approved" | "rejected") => {
    set((state: AssetStore) => ({
      requests: state.requests.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  },

  updateMediatedTransferProposalStatus: (id: string, status: "pending" | "approved" | "rejected" | "executed") => {
    set((state: AssetStore) => ({
      mediatedTransferProposals: state.mediatedTransferProposals.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    }));
  },

  getBuildings: () => get().buildings,
  getRequests: () => get().requests,
  getMediatedTransferProposals: () => get().mediatedTransferProposals,

  // Load properties from blockchain
  loadPropertiesFromBlockchain: async (userAddress?: string) => {
    set({ isLoadingBlockchain: true, blockchainError: null });
    console.log("loadPropertiesFromBlockchain called with userAddress:", userAddress);
    try {
      await blockchainService.initialize();
      const properties = await blockchainService.getAllProperties();
      console.log("Fetched all properties from blockchain:", properties);
      
      const allBlockchainBuildings = properties.map((prop, idx) => propertyToBuilding(prop, idx));
      console.log("All blockchain buildings (before filtering):", allBlockchainBuildings);

      const blockchainBuildings = allBlockchainBuildings
        .filter(building => {
          if (!userAddress) return true; // If no userAddress, show all
          const isOwner = building?.fractionalOwnership?.some(owner => {
            const match = owner.address.toLowerCase() === userAddress.toLowerCase();
            if (match) {
              console.log(`Match found for building ${building.id}: owner ${owner.address} === user ${userAddress}`);
            }
            return match;
          });
          if (!isOwner) {
            console.log(`Building ${building.id} not owned by user ${userAddress}`);
          }
          return isOwner;
        });
      
      console.log("Filtered blockchain buildings (after filtering):", blockchainBuildings);
      
      set({
        buildings: blockchainBuildings,
        isLoadingBlockchain: false,
      });
    } catch (error: any) {
      console.error("Failed to load properties from blockchain:", error);
      set({
        blockchainError: error.message || "Failed to load blockchain data",
        isLoadingBlockchain: false,
        // Keep mock data if blockchain fails
        buildings: mockBuildings,
      });
    }
  },

  loadMediatedTransferProposals: async () => {
    set({ isLoadingBlockchain: true, blockchainError: null });
    try {
      // Assuming blockchainService.provider is available or can be initialized
      await blockchainService.initialize();
      const provider = blockchainService.provider; // Or use blockchainService.provider if it's exposed
      const proposals = await getMediatedTransferProposals(provider!);
      set({
        mediatedTransferProposals: proposals,
        isLoadingBlockchain: false,
      });
    } catch (error: any) {
      console.error("Failed to load mediated transfer proposals:", error);
      set({
        blockchainError: error.message || "Failed to load mediated transfer proposals",
        isLoadingBlockchain: false,
      });
    }
  },

  // Register a new property on blockchain
  registerPropertyOnBlockchain: async (name: string, owners: string[], shares: number[]) => {
    set({ isLoadingBlockchain: true, blockchainError: null });
    try {
      await blockchainService.registerProperty({ name, owners, shares });
      
      // Reload all properties after registration
      await get().loadPropertiesFromBlockchain();
    } catch (error: any) {
      console.error("Failed to register property on blockchain:", error);
      set({
        blockchainError: error.message || "Failed to register property",
        isLoadingBlockchain: false,
      });
      throw error;
    }
  },

  // Sync with blockchain - refresh data
  syncWithBlockchain: async () => {
    await get().loadPropertiesFromBlockchain();
    await get().loadMediatedTransferProposals();
  },

  // Transfer full ownership of a property
  transferFullOwnership: async (params: { propertyId: number; to: string }) => {
    set({ isLoadingBlockchain: true, blockchainError: null });
    try {
      await blockchainService.transferFullOwnership(params);
      toast.success("Ownership transfer initiated successfully!");
      await get().loadPropertiesFromBlockchain(get().user?.address); // Refresh data for current user
    } catch (error: any) {
      console.error("Failed to transfer full ownership:", error);
      set({
        blockchainError: error.message || "Failed to transfer ownership",
        isLoadingBlockchain: false,
      });
      throw error;
    } finally {
      set({ isLoadingBlockchain: false });
    }
  },

  // Initiate a mediated transfer request
  initiateTransferRequest: async (params: { propertyId: number; to: string; from: string }) => {
    set({ isLoadingBlockchain: true, blockchainError: null });
    try {
      await blockchainService.initiateMediatedTransfer(params);
      toast.success("Transfer proposal initiated successfully!");
      await get().loadMediatedTransferProposals(); // Refresh proposals
    } catch (error: any) {
      console.error("Failed to initiate mediated transfer:", error);
      set({
        blockchainError: error.message || "Failed to initiate transfer proposal",
        isLoadingBlockchain: false,
      });
      throw error;
    } finally {
      set({ isLoadingBlockchain: false });
    }
  },
}));
