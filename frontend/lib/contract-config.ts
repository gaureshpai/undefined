// Smart contract configuration
import PropertyRegistryABI from "../contracts/PropertyRegistry.json";
import FractionalizerABI from "../contracts/Fractionalizer.json";
import FractionalNFTABI from "../contracts/FractionalNFT.json";

export const CONTRACT_CONFIG = {
  // Update this address after deploying the contract
  // You can get this from the deployment script output
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x181b270c2E5Ee12a3E9E049b88b0426d2381ae56",
  propertyRegistryAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x181b270c2E5Ee12a3E9E049b88b0426d2381ae56",
  mediatedTransferAddress: process.env.NEXT_PUBLIC_MEDIATED_TRANSFER_ADDRESS || "0x0000000000000000000000000000000000000000",
  
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
