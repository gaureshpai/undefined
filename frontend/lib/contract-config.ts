// Smart contract configuration
export const CONTRACT_CONFIG = {
  // Update this address after deploying the contract
  // You can get this from the deployment script output
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xb4210da958474c648F75d0E170521FCe947a6075",
  
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