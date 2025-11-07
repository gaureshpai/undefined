import { ethers, Contract, Signer, Wallet, BrowserProvider, JsonRpcProvider } from "ethers";
import { CONTRACT_CONFIG, getRpcUrl } from "./contract-config";
import type {
  PropertyData,
  PropertyDetails,
  RegisterPropertyParams,
} from "./contract-types";

declare global {
  interface Window {
    ethereum?: any; // MetaMask injects window.ethereum
  }
}

class BlockchainService {
  provider: ethers.Provider | null = null;
  private propertyRegistryContract: Contract | null = null;
  private fractionalizerContract: Contract | null = null;
  private signer: Signer | null = null;

  async connectMetaMask(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error("MetaMask is not installed!");
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const browserProvider: ethers.BrowserProvider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await browserProvider.getSigner();
      if (!this.signer) {
        throw new Error("Could not get a signer from BrowserProvider.");
      }

      this.propertyRegistryContract = new Contract(
        CONTRACT_CONFIG.propertyRegistry.address,
        CONTRACT_CONFIG.propertyRegistry.abi,
        this.signer
      );
      this.fractionalizerContract = new Contract(
        CONTRACT_CONFIG.fractionalizer.address,
        CONTRACT_CONFIG.fractionalizer.abi,
        this.signer
      );
      return await this.signer.getAddress();
    } catch (error) {
      console.error("Failed to connect to MetaMask:", error);
      throw error;
    }
  }

  async initialize(privateKey?: string): Promise<string> {
    try {
      this.provider = new ethers.JsonRpcProvider(getRpcUrl());
      let currentSigner: Signer | null = null;

      if (privateKey) {
        currentSigner = new Wallet(privateKey, this.provider);
      } else if (this.signer) { // Use existing signer from MetaMask if available
        currentSigner = this.signer;
      }

      if (currentSigner) {
        this.signer = currentSigner;
        this.propertyRegistryContract = new Contract(
          CONTRACT_CONFIG.propertyRegistry.address,
          CONTRACT_CONFIG.propertyRegistry.abi,
          this.signer
        );
        this.fractionalizerContract = new Contract(
          CONTRACT_CONFIG.fractionalizer.address,
          CONTRACT_CONFIG.fractionalizer.abi,
          this.signer
        );
        return await this.signer.getAddress();
      } else {
        // Read-only mode if no signer is available
        this.propertyRegistryContract = new Contract(
          CONTRACT_CONFIG.propertyRegistry.address,
          CONTRACT_CONFIG.propertyRegistry.abi,
          this.provider
        );
        this.fractionalizerContract = new Contract(
          CONTRACT_CONFIG.fractionalizer.address,
          CONTRACT_CONFIG.fractionalizer.abi,
          this.provider
        );
        return "";
      }
    } catch (error) {
      console.error("Failed to initialize blockchain service:", error);
      throw error;
    }
  }

  async initializeWithMagic(magic: any): Promise<string> {
    try {
      const provider = new ethers.BrowserProvider(magic.rpcProvider);
      this.provider = provider;
      this.signer = await provider.getSigner();
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
      console.error("Failed to initialize blockchain service with Magic:", error);
      throw error;
    }
  }

  /**
   * Get the total number of properties
   */
  async getPropertyCount(): Promise<number> {
    if (!this.propertyRegistryContract) await this.initialize();
    try {
      const count = await this.propertyRegistryContract!.propertyCount();
      return Number(count);
    } catch (error) {
      console.error("Failed to get property count:", error);
      return 0;
    }
  }

  async getProperty(propertyId: number): Promise<PropertyData | null> {
    if (!this.propertyRegistryContract) await this.initialize();
    try {
      const [id, name, partnershipAgreementUrl, maintenanceAgreementUrl, rentAgreementUrl, imageUrl] = await this.propertyRegistryContract!.getProperty(propertyId);
      const owner = await this.propertyRegistryContract!.ownerOf(propertyId);
      return {
        id: Number(id),
        name: name,
        owner: owner,
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

  async getAllProperties(): Promise<PropertyDetails[]> {
    const count = await this.getPropertyCount();
    const properties: PropertyDetails[] = [];

    for (let i = 1; i <= count; i++) {
      const property = await this.getProperty(i);
      if (property) {
        properties.push({
          id: property.id,
          name: property.name,
          owner: property.owner,
          partnershipAgreementUrl: property.partnershipAgreementUrl,
          maintenanceAgreementUrl: property.maintenanceAgreementUrl,
          rentAgreementUrl: property.rentAgreementUrl,
          imageUrl: property.imageUrl,
        });
      }
    }
    return properties;
  }

  async registerProperty(params: RegisterPropertyParams): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.propertyRegistryContract || !this.signer) {
      await this.initialize();
    }

    try {
      // Estimate gas before sending the transaction
      const gasEstimate = await this.propertyRegistryContract!.registerProperty.estimateGas(
        params.name,
        params.owner,
        params.partnershipAgreementUrl,
        params.maintenanceAgreementUrl,
        params.rentAgreementUrl,
        params.imageUrl
      );

      const tx = await this.propertyRegistryContract!.registerProperty(
        params.name,
        params.owner,
        params.partnershipAgreementUrl,
        params.maintenanceAgreementUrl,
        params.rentAgreementUrl,
        params.imageUrl,
        { gasLimit: gasEstimate }
      );

      const receipt = await tx.wait();
      console.log("Property registered:", receipt);
      return receipt;
    } catch (error: any) {
      console.error("Failed to register property:", error);

      // Attempt to get a more descriptive error message
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to register property.");
    }
  }

  async fractionalizeNFT(
    propertyId: number,
    name: string,
    symbol: string,
    totalSupply: number
  ): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.fractionalizerContract || !this.signer) {
      throw new Error("Signer or Fractionalizer contract not available. Please connect MetaMask first.");
    }
    try {
      const tx = await this.fractionalizerContract.fractionalizeNFT(propertyId, name, symbol, totalSupply);
      const receipt = await tx.wait();
      console.log("NFT fractionalized:", receipt);
      return receipt;
    } catch (error) {
      console.error("Failed to fractionalize NFT:", error);
      throw error;
    }
  }

  async transferFractionalNFT(
    fractionalNFTAddress: string,
    to: string,
    amount: number
  ): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.signer) {
      throw new Error("Signer not available. Please connect MetaMask first.");
    }

    try {
      const fractionalNFTContract = new Contract(
        fractionalNFTAddress,
        CONTRACT_CONFIG.fractionalNFT.abi,
        this.signer
      );

      const tx = await fractionalNFTContract.transfer(to, amount);
      const receipt = await tx.wait();
      console.log("Transfer successful:", receipt);
      return receipt;
    } catch (error: any) {
      console.error("Failed to transfer fractional NFT:", error);
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to transfer fractional NFT.");
    }
  }

  private async getRevertReason(error: any): Promise<string | null> {
    if (error.reason) {
      return error.reason;
    }

    let reason: string | null = null;
    if (error.data) {
      try {
        const decodedError = this.propertyRegistryContract!.interface.parseError(error.data);
        if (decodedError) {
          reason = decodedError.name;
        }
      } catch (e) {
        console.error("Failed to parse error data:", e);
      }
    }
    return reason;
  }

  async getFractionalNFTDetails(propertyId: number): Promise<any | null> {
    if (!this.fractionalizerContract || !this.provider) await this.initialize();
    try {
      const fractionalNFTAddress = await this.fractionalizerContract!.nftFractions(propertyId);
      if (fractionalNFTAddress === ethers.ZeroAddress) return null;

      const fractionalNFTContract = new Contract(
        fractionalNFTAddress,
        CONTRACT_CONFIG.fractionalNFT.abi,
        this.provider
      );

      const name = await fractionalNFTContract.name();
      const symbol = await fractionalNFTContract.symbol();
      const totalSupply = await fractionalNFTContract.totalSupply();

      return {
        address: fractionalNFTAddress,
        name,
        symbol,
        totalSupply: Number(totalSupply),
      };
    } catch (error) {
      console.error(`Failed to get fractional NFT details for property ${propertyId}:`, error);
      return null;
    }
  }

  async getOwnedFractionalNFTs(ownerAddress: string): Promise<any[]> {
    const properties = await this.getAllProperties();
    const ownedFractionalNFTs: any[] = [];

    for (const property of properties) {
      const fractionalNFTDetails = await this.getFractionalNFTDetails(property.id);
      if (fractionalNFTDetails) {
        const fractionalNFTContract = new Contract(
          fractionalNFTDetails.address,
          CONTRACT_CONFIG.fractionalNFT.abi,
          this.provider
        );
        const balance = await fractionalNFTContract.balanceOf(ownerAddress);
        if (balance > 0) {
          ownedFractionalNFTs.push({
            propertyId: property.id,
            propertyName: property.name,
            fractionalNFTAddress: fractionalNFTDetails.address,
            fractionalNFTName: fractionalNFTDetails.name,
            fractionalNFTSymbol: fractionalNFTDetails.symbol,
            totalSupply: fractionalNFTDetails.totalSupply,
            balance: Number(balance),
            percentage: (Number(balance) / fractionalNFTDetails.totalSupply) * 100,
          });
        }
      }
    }
    return ownedFractionalNFTs;
  }

  onPropertyRegistered(callback: (propertyId: bigint, name: string, owner: string) => void): void {
    if (!this.propertyRegistryContract) {
      console.warn("PropertyRegistry contract not initialized");
      return;
    }
    this.propertyRegistryContract.on("PropertyRegistered", callback);
  }

  removeAllListeners(): void {
    if (this.propertyRegistryContract) {
      this.propertyRegistryContract.removeAllListeners();
    }
    if (this.fractionalizerContract) {
      this.fractionalizerContract.removeAllListeners();
    }
  }

  getSigner(): Signer | null {
    return this.signer;
  }

  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error("Failed to get current address:", error);
      return null;
    }
  }
}

export const blockchainService = new BlockchainService();