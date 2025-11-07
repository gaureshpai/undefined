import { ethers, Contract, Signer, Wallet, BrowserProvider, JsonRpcProvider } from "ethers";
import PropertyRegistryArtifact from "../contracts/PropertyRegistry.json";
import MediatedTransferArtifact from "../contracts/MediatedTransfer.json";
import { CONTRACT_CONFIG, getRpcUrl } from "./contract-config";
import type {
  PropertyData,
  PropertyDetails,
  PropertyOwner,
  RegisterPropertyParams,
  TransferShareParams,
  TransferFullOwnershipParams,
  InitiateMediatedTransferParams,
} from "./contract-types";



declare global {
  interface Window {
    ethereum?: any; // MetaMask injects window.ethereum
  }
}

class BlockchainService {
  provider: ethers.Provider | null = null;
  private contract: Contract | null = null;
  private mediatedTransferContract: Contract | null = null;
  private signer: Signer | null = null;

  async connectMetaMask(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error("MetaMask is not installed!");
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

            const browserProvider: ethers.BrowserProvider = new ethers.BrowserProvider(window.ethereum);

            // this.provider = browserProvider; // Assign to the more general type

            // Now, we know this.provider is a BrowserProvider, so we can safely get the signer
            this.signer = await browserProvider.getSigner(); // Line 36
            if (!this.signer) {
                throw new Error("Could not get a signer from BrowserProvider.");
            }

            this.contract = new Contract(
              CONTRACT_CONFIG.propertyRegistryAddress,
              PropertyRegistryArtifact.abi,
              this.signer
            );
            this.mediatedTransferContract = new Contract(
              CONTRACT_CONFIG.mediatedTransferAddress,
              MediatedTransferArtifact.abi,
              this.signer
            );
      return await this.signer.getAddress();
    } catch (error) {
      console.error("Failed to connect to MetaMask:", error);
      throw error;
    }
  }

  /**
   * Initialize the blockchain service with a provider or signer
   * @param privateKey - Optional private key for Wallet signer
   */
  async initialize(privateKey?: string): Promise<string> {
    try {
      this.provider = new ethers.JsonRpcProvider(getRpcUrl());
      if (privateKey) {
        this.signer = new Wallet(privateKey, this.provider);
        this.contract = new Contract(
          CONTRACT_CONFIG.propertyRegistryAddress,
          PropertyRegistryArtifact.abi,
          this.signer
        );
        this.mediatedTransferContract = new Contract(
          CONTRACT_CONFIG.mediatedTransferAddress,
          MediatedTransferArtifact.abi,
          this.signer
        );
        return await this.signer.getAddress();
      } else if (!this.signer) { // Only re-initialize with provider if no signer is present
        // For read-only operations without a signer
        this.contract = new Contract(
          CONTRACT_CONFIG.propertyRegistryAddress,
          PropertyRegistryArtifact.abi,
          this.provider
        );
        this.mediatedTransferContract = new Contract(
          CONTRACT_CONFIG.mediatedTransferAddress,
          MediatedTransferArtifact.abi,
          this.provider
        );
        return ""; // No address associated with read-only provider
      }
      // If privateKey is not provided and a signer is already present, do nothing to preserve the signer
      return this.signer ? await this.signer.getAddress() : "";
      
    } catch (error) {
      console.error("Failed to initialize blockchain service:", error);
      throw error;
    }
  }



  /**
   * Get the total number of properties
   */
  async getPropertyCount(): Promise<number> {
    if (!this.contract) await this.initialize();
    try {
      const count = await this.contract!.propertyCount();
      return Number(count);
    } catch (error) {
      console.error("Failed to get property count:", error);
      return 0;
    }
  }

  /**
   * Get property details by ID
   */
  async getProperty(propertyId: number): Promise<PropertyData | null> {
    if (!this.contract) await this.initialize();
    try {
      const [id, name, ownersCount, partnershipAgreementUrl, maintenanceAgreementUrl, rentAgreementUrl, imageUrl] = await this.contract!.getProperty(propertyId);
      return {
        id: Number(id),
        name: name,
        ownersCount: Number(ownersCount),
        partnershipAgreementUrl,
        maintenanceAgreementUrl,
        rentAgreementUrl,
        imageUrl,
      };
    } catch (error) {
      console.error(`Failed to get property ${propertyId}:`, error);
      return null;
    }
  }

  /**
   * Get owners of a property
   */
  async getOwners(propertyId: number): Promise<PropertyOwner[]> {
    if (!this.contract) await this.initialize();
    try {
      const [ownerAddresses, ownerShares] = await this.contract!.getOwners(propertyId);
      return ownerAddresses.map((address: string, index: number) => ({
        wallet: address,
        percentage: Number(ownerShares[index]),
      }));
    } catch (error) {
      console.error(`Failed to get owners for property ${propertyId}:`, error);
      return [];
    }
  }

  /**
   * Get complete property details including owners
   */
  async getPropertyDetails(propertyId: number): Promise<PropertyDetails | null> {
    const property = await this.getProperty(propertyId);
    if (!property) return null;

    const owners = await this.getOwners(propertyId);
    return {
      id: property.id,
      name: property.name,
      owners,
      partnershipAgreementUrl: property.partnershipAgreementUrl,
      maintenanceAgreementUrl: property.maintenanceAgreementUrl,
      rentAgreementUrl: property.rentAgreementUrl,
      imageUrl: property.imageUrl,
    };
  }

  /**
   * Get all properties
   */
  async getAllProperties(): Promise<PropertyDetails[]> {
    const count = await this.getPropertyCount();
    const properties: PropertyDetails[] = [];

    for (let i = 1; i <= count; i++) {
      const property = await this.getPropertyDetails(i);
      if (property) {
        properties.push(property);
      }
    }

    return properties;
  }

  /**
   * Register a new property (requires signer)
   */
  async registerProperty(params: RegisterPropertyParams): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.contract || !this.signer) {
      throw new Error("Signer not available. Please connect MetaMask first.");
    }

    try {
      const tx = await this.contract.registerProperty(
        params.name,
        params.owners,
        params.shares,
        params.partnershipAgreementUrl,
        params.maintenanceAgreementUrl,
        params.rentAgreementUrl,
        params.imageUrl
      );
      const receipt = await tx.wait();
      console.log("Property registered:", receipt);
      return receipt;
    } catch (error) {
      console.error("Failed to register property:", error);
      throw error;
    }
  }

  /**
   * Transfer share of a property (requires signer)
   */
  async transferShare(params: TransferShareParams): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.contract || !this.signer) {
      throw new Error("Signer not available. Please connect MetaMask first.");
    }

    try {
      const tx = await this.contract.transferShare(
        params.propertyId,
        params.to,
        params.percent
      );
      const receipt = await tx.wait();
      console.log("Share transferred:", receipt);
      return receipt;
    } catch (error) {
      console.error("Failed to transfer share:", error);
      throw error;
    }
  }

  /**
   * Transfer full ownership of a property (requires signer)
   */
  async transferFullOwnership(params: TransferFullOwnershipParams): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.contract || !this.signer) {
      throw new Error("Signer not available. Please connect MetaMask first.");
    }

    try {
      const tx = await this.contract.transferFullOwnership(
        params.propertyId,
        params.to
      );
      const receipt = await tx.wait();
      console.log("Full ownership transferred:", receipt);
      return receipt;
    } catch (error) {
      console.error("Failed to transfer full ownership:", error);
      throw error;
    }
  }

  /**
   * Listen for PropertyRegistered events
   */
  onPropertyRegistered(callback: (propertyId: bigint, name: string) => void): void {
    if (!this.contract) {
      console.warn("Contract not initialized");
      return;
    }

    this.contract.on("PropertyRegistered", callback);
  }

  /**
   * Listen for ShareTransferred events
   */
  onShareTransferred(
    callback: (propertyId: bigint, from: string, to: string, percent: bigint) => void
  ): void {
    if (!this.contract) {
      console.warn("Contract not initialized");
      return;
    }

    this.contract.on("ShareTransferred", callback);
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  getSigner(): Signer | null {
    return this.signer;
  }

  /**
   * Get the current connected address
   */
  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error("Failed to get current address:", error);
      return null;
    }
  }

  /**
   * Initiate a mediated transfer proposal (requires signer)
   */
  async initiateMediatedTransfer(params: InitiateMediatedTransferParams): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.mediatedTransferContract || !this.signer) {
      throw new Error("Signer or MediatedTransfer contract not available. Please connect MetaMask first.");
    }

    try {
      const tx = await this.mediatedTransferContract.proposeTransfer(
        params.propertyId,
        "0x0000000000000000000000000000000000000000", // Placeholder for mediator address
        [params.to]
      );
      const receipt = await tx.wait();
      console.log("Mediated transfer initiated:", receipt);
      return receipt;
    } catch (error) {
      console.error("Failed to initiate mediated transfer:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const blockchainService = new BlockchainService();
