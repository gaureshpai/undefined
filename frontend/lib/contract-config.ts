export const contractConfig = {
  propertyRegistryAddress: process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || "0xD6eb4a4010a830c2cfc878354dBdbccfaf2a0D35",
  mediatedTransferAddress: process.env.NEXT_PUBLIC_MEDIATED_TRANSFER_ADDRESS || "",
  network: {
    localhost: {
      url: "http://127.0.0.1:7545",
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
  return contractConfig.network[contractConfig.currentNetwork].url;
}

export function getChainId(): number {
  return contractConfig.network[contractConfig.currentNetwork].chainId;
}