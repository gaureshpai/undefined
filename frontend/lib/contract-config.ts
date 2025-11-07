// Smart contract configuration
import PropertyRegistryArtifact from "../contracts/PropertyRegistry.json";
import FractionalizerArtifact from "../contracts/Fractionalizer.json";
import FractionalNFTArtifact from "../contracts/FractionalNFT.json";

export const CONTRACT_CONFIG = {
  propertyRegistry: {
    address: process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || "0x9Ebd104d447a8451A8308065597535431a105595",
    abi: PropertyRegistryArtifact.abi,
  },
  fractionalizer: {
    address: process.env.NEXT_PUBLIC_FRACTIONALIZER_ADDRESS || "0x689065448A5459A926332d1137E45799468c9875",
    abi: FractionalizerArtifact.abi,
  },
  fractionalNFT: {
    abi: FractionalNFTArtifact.abi,
  },
  
  // Network configuration - matches hardhat.config.ts
  network: {
    localhost: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
    },
    hardhat: {
      url: "http://127.0.0.1:7545",
      chainId: 31337,
    },
  },
  currentNetwork: "localhost" as const,
};

export function getRpcUrl(): string {
  return CONTRACT_CONFIG.network[CONTRACT_CONFIG.currentNetwork].url;
}

export function getChainId(): number {
  return CONTRACT_CONFIG.network[CONTRACT_CONFIG.currentNetwork].chainId;
}
