import { create } from "zustand";
import {
  type BuildingAsset,
  type TokenRequest,
  mockBuildings,
  mockRequests,
} from "./asset-data";

interface AssetStore {
  buildings: BuildingAsset[];
  requests: TokenRequest[];
  addBuilding: (building: BuildingAsset) => void;
  updateBuildingStatus: (id: string, status: "approved" | "rejected") => void;
  addRequest: (request: TokenRequest) => void;
  updateRequestStatus: (id: string, status: "approved" | "rejected") => void;
  getBuildings: () => BuildingAsset[];
  getRequests: () => TokenRequest[];
}

export const useAssetStore = create<AssetStore>((set: any, get: any) => ({
  buildings: mockBuildings,
  requests: mockRequests,

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

  getBuildings: () => get().buildings,
  getRequests: () => get().requests,
}));
