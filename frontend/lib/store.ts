import { create } from "zustand";
import { blockchainService } from "./blockchain-service";
import type { PropertyDetails, OwnedFractionalNFT } from "./contract-types";
import { toast } from "sonner";

interface AssetStore {
  buildings: PropertyDetails[];
  ownedFractionalNFTs: OwnedFractionalNFT[];
  isLoadingBlockchain: boolean;
  blockchainError: string | null;
  hasLoaded: boolean;
  // Blockchain methods
  loadPropertiesFromBlockchain: (userAddress?: string) => Promise<void>;
  registerPropertyOnBlockchain: (params: { name: string; owner: string; partnershipAgreementUrl: string; maintenanceAgreementUrl: string; rentAgreementUrl: string; imageUrl: string; }) => Promise<void>;
  fractionalizeNFT: (propertyId: number, name: string, symbol: string, totalSupply: number) => Promise<void>;
  loadOwnedFractionalNFTs: (userAddress: string) => Promise<void>;
  setHasLoaded: (hasLoaded: boolean) => void;
}

export const useAssetStore = create<AssetStore>((set: any, get: any) => ({
  buildings: [],
  ownedFractionalNFTs: [],
  isLoadingBlockchain: false,
  blockchainError: null,
  hasLoaded: false,

  setHasLoaded: (hasLoaded: boolean) => set({ hasLoaded }),

  // Load properties from blockchain
  loadPropertiesFromBlockchain: async (userAddress?: string) => {
    if (get().hasLoaded) return;
    set({ isLoadingBlockchain: true, blockchainError: null });
    try {
      await blockchainService.initialize();
      const properties = await blockchainService.getAllProperties();
      
      const filteredProperties = properties
        .filter(property => {
          if (!userAddress) return true; // If no userAddress, show all
          return property.owner.toLowerCase() === userAddress.toLowerCase();
        });
      
      set({
        buildings: filteredProperties,
        isLoadingBlockchain: false,
      });
    } catch (error: any) {
      console.error("Failed to load properties from blockchain:", error);
      set({
        blockchainError: error.message || "Failed to load blockchain data",
        isLoadingBlockchain: false,
        buildings: [], // Clear buildings on error
      });
    }
  },

  // Register a new property on blockchain
  registerPropertyOnBlockchain: async (params) => {
    set({ isLoadingBlockchain: true, blockchainError: null });
    try {
      await blockchainService.registerProperty(params);
      toast.success("Property registered successfully!");
      // Reload all properties after registration
      await get().loadPropertiesFromBlockchain();
    } catch (error: any) {
      console.error("Failed to register property on blockchain:", error);
      set({
        blockchainError: error.message || "Failed to register property",
        isLoadingBlockchain: false,
      });
      throw error;
    } finally {
      set({ isLoadingBlockchain: false });
    }
  },

  // Fractionalize NFT
  fractionalizeNFT: async (propertyId: number, name: string, symbol: string, totalSupply: number) => {
    set({ isLoadingBlockchain: true, blockchainError: null });
    try {
      await blockchainService.fractionalizeNFT(propertyId, name, symbol, totalSupply);
      toast.success("NFT fractionalized successfully!");
      await get().loadPropertiesFromBlockchain(); // Refresh properties to show fractionalized status if applicable
    } catch (error: any) {
      console.error("Failed to fractionalize NFT:", error);
      set({
        blockchainError: error.message || "Failed to fractionalize NFT",
        isLoadingBlockchain: false,
      });
      throw error;
    } finally {
      set({ isLoadingBlockchain: false });
    }
  },

  // Load owned fractional NFTs
  loadOwnedFractionalNFTs: async (userAddress: string) => {
    set({ isLoadingBlockchain: true, blockchainError: null });
    try {
      await blockchainService.initialize();
      const ownedFractions = await blockchainService.getOwnedFractionalNFTs(userAddress);
      set({
        ownedFractionalNFTs: ownedFractions,
        isLoadingBlockchain: false,
      });
    } catch (error: any) {
      console.error("Failed to load owned fractional NFTs:", error);
      set({
        blockchainError: error.message || "Failed to load owned fractional NFTs",
        isLoadingBlockchain: false,
        ownedFractionalNFTs: [],
      });
    }
  },

  // Sync with blockchain - refresh data
  syncWithBlockchain: async () => {
    await get().loadPropertiesFromBlockchain();
    const currentUserAddress = await blockchainService.getCurrentAddress();
    if (currentUserAddress) {
      await get().loadOwnedFractionalNFTs(currentUserAddress);
    }
  },
}));