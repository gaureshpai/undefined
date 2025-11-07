// Smart contract configuration
import PropertyRegistryArtifact from "../contracts/PropertyRegistry.json";
import FractionalizerArtifact from "../contracts/Fractionalizer.json";
import FractionalNFTArtifact from "../contracts/FractionalNFT.json";

export const CONTRACT_CONFIG = {
  propertyRegistry: {
    // Support multiple env var names for convenience
    address:
      process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS ||
      (process.env as any).NEXT_PUBLIC_PROPERTYREG ||
      "0xe576Ca7a29387968c2C4456F6df1f8aE17967fd2",
    abi: PropertyRegistryArtifact.abi,
  },
  fractionalizer: {
    address:
      process.env.NEXT_PUBLIC_FRACTIONALIZER_ADDRESS ||
      (process.env as any).NEXT_PUBLIC_FRACTIONALIZER ||
      "0x081303FaFA34A2fab3938617d4871DF5F6293832",
    abi: FractionalizerArtifact.abi,
  },
  fractionalNFT: {
    abi: FractionalNFTArtifact.abi,
  },
  
  // Network configuration - defaults; override with NEXT_PUBLIC_RPC_URL/CHAIN_ID
  network: {
    localhost: {
      url: "HTTP://127.0.0.1:7545",
      chainId: 1337,
    },
    hardhat: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  currentNetwork: "localhost" as const,
};

export function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_RPC_URL || CONTRACT_CONFIG.network[CONTRACT_CONFIG.currentNetwork].url;
}

export function getChainId(): number {
  const envId = process.env.NEXT_PUBLIC_CHAIN_ID ? Number(process.env.NEXT_PUBLIC_CHAIN_ID) : undefined;
  return envId || CONTRACT_CONFIG.network[CONTRACT_CONFIG.currentNetwork].chainId;
}
