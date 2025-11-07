import { ethers, Contract, Signer, Wallet, BrowserProvider, JsonRpcProvider } from "ethers";
import { CONTRACT_CONFIG, getRpcUrl } from "./contract-config";
import type {
  CreatePropertyRequestParams,
  PropertyData,
  PropertyDetails,
  PropertyRequest,
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
  private initializedContracts = false;
  private lastPrivateKey?: string;

  private async assertContractCode(address: string, name: string) {
    if (!this.provider) return;
    try {
      const code = await this.provider.getCode(address);
      if (!code || code === '0x') {
        throw new Error(`${name} not deployed at ${getRpcUrl()}. Set NEXT_PUBLIC_*_ADDRESS to a valid Ganache deployment.`);
      }
    } catch (e) {
      throw e;
    }
  }

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
        CONTRACT_CONFIG.propertyRegistry.address.toLowerCase(),
        CONTRACT_CONFIG.propertyRegistry.abi,
        this.signer
      );
      this.fractionalizerContract = new Contract(
        CONTRACT_CONFIG.fractionalizer.address.toLowerCase(),
        CONTRACT_CONFIG.fractionalizer.abi,
        this.signer
      );
      await this.assertContractCode(CONTRACT_CONFIG.propertyRegistry.address.toLowerCase(), 'PropertyRegistry');
      await this.assertContractCode(CONTRACT_CONFIG.fractionalizer.address.toLowerCase(), 'Fractionalizer');
      this.initializedContracts = true;
      return await this.signer.getAddress();
    } catch (error) {
      console.error("Failed to connect to MetaMask:", error);
      throw error;
    }
  }

  async initialize(privateKey?: string): Promise<string> {
    try {
      // Fast path: already initialized and no new privateKey context
      if (
        this.provider &&
        this.propertyRegistryContract &&
        this.fractionalizerContract &&
        (!privateKey || this.lastPrivateKey === privateKey || this.signer)
      ) {
        const addr = await this.getCurrentAddress();
        return addr || "";
      }

      this.provider = new ethers.JsonRpcProvider(
        getRpcUrl(),
        undefined,
        {
          staticNetwork: true,
          batchMaxCount: 1,
          fetchOptions: {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }
        } as any
      );
      let currentSigner: Signer | null = null;

      if (privateKey) {
        currentSigner = new Wallet(privateKey, this.provider);
        this.lastPrivateKey = privateKey;
      } else if (this.signer) { // Use existing signer from MetaMask if available
        currentSigner = this.signer;
      }

      if (currentSigner) {
        this.signer = currentSigner;
        this.propertyRegistryContract = new Contract(
          CONTRACT_CONFIG.propertyRegistry.address.toLowerCase(),
          CONTRACT_CONFIG.propertyRegistry.abi,
          this.signer
        );
        this.fractionalizerContract = new Contract(
          CONTRACT_CONFIG.fractionalizer.address.toLowerCase(),
          CONTRACT_CONFIG.fractionalizer.abi,
          this.signer
        );
        if (!this.initializedContracts) {
          await this.assertContractCode(CONTRACT_CONFIG.propertyRegistry.address.toLowerCase(), 'PropertyRegistry');
          await this.assertContractCode(CONTRACT_CONFIG.fractionalizer.address.toLowerCase(), 'Fractionalizer');
          this.initializedContracts = true;
        }
        return await this.signer.getAddress();
      } else {
        // Read-only mode if no signer is available
        this.propertyRegistryContract = new Contract(
          CONTRACT_CONFIG.propertyRegistry.address.toLowerCase(),
          CONTRACT_CONFIG.propertyRegistry.abi,
          this.provider
        );
        this.fractionalizerContract = new Contract(
          CONTRACT_CONFIG.fractionalizer.address.toLowerCase(),
          CONTRACT_CONFIG.fractionalizer.abi,
          this.provider
        );
        if (!this.initializedContracts) {
          await this.assertContractCode(CONTRACT_CONFIG.propertyRegistry.address.toLowerCase(), 'PropertyRegistry');
          await this.assertContractCode(CONTRACT_CONFIG.fractionalizer.address.toLowerCase(), 'Fractionalizer');
          this.initializedContracts = true;
        }
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
      this.propertyRegistryContract = new Contract(
        CONTRACT_CONFIG.propertyRegistry.address,
        CONTRACT_CONFIG.propertyRegistry.abi,
        this.signer
      );
      this.initializedContracts = true;
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
      const count = await this.propertyRegistryContract?.propertyCount();
      return Number(count);
    } catch (error) {
      console.error("Failed to get property count:", error);
      return 0;
    }
  }

  async getProperty(propertyId: number): Promise<PropertyData | null> {
    if (!this.propertyRegistryContract) await this.initialize();
    try {
      const [id, name, partnershipAgreementUrl, maintenanceAgreementUrl, rentAgreementUrl, imageUrl] = await this.propertyRegistryContract?.getProperty(propertyId);
      const owner = await this.propertyRegistryContract?.ownerOf(propertyId);
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

  async requestCount(): Promise<number> {
    if (!this.propertyRegistryContract) await this.initialize();
    try {
      const count = await this.propertyRegistryContract?.requestCount();
      return Number(count);
    } catch (error) {
      console.error("Failed to get request count:", error);
      return 0;
    }
  }

  async getRequest(requestId: number): Promise<PropertyRequest | null> {
    if (!this.propertyRegistryContract) await this.initialize();
    try {
      const [id, name, partnershipAgreementUrl, maintenanceAgreementUrl, rentAgreementUrl, imageUrl, requester, status, propertyId] = await this.propertyRegistryContract?.getRequest(requestId);
      return {
        id: Number(id),
        name: name,
        partnershipAgreementUrl,
        maintenanceAgreementUrl,
        rentAgreementUrl,
        imageUrl,
        requester: requester,
        status: Number(status),
        propertyId: Number(propertyId),
        owners: [], // Owners are fetched separately
      };
    } catch (error) {
      console.error(`Failed to get request ${requestId}:`, error);
      return null;
    }
  }

  async getRequestOwners(requestId: number): Promise<[string[], number[]]> {
    if (!this.propertyRegistryContract) await this.initialize();
    try {
      const [ownerAddresses, percentages] = await this.propertyRegistryContract?.getRequestOwners(requestId);
      return [ownerAddresses, percentages.map(Number)];
    } catch (error) {
      console.error(`Failed to get request owners for request ${requestId}:`, error);
      return [[], []];
    }
  }

  async approveRequest(requestId: number): Promise<number | null> {
    if (!this.propertyRegistryContract || !this.signer) {
      await this.initialize();
    }
    try {
      // const gasEstimate = await this.propertyRegistryContract?.approveRequest.estimateGas(requestId);
      // const tx = await this.propertyRegistryContract?.approveRequest(requestId, { gasLimit: gasEstimate });
      const tx = await this.propertyRegistryContract?.approveRequest(requestId);
      const receipt = await tx.wait();
      console.log("Request approved:", receipt);

      // Parse the receipt to find the PropertyRequestApproved event
      const event = receipt?.logs?.find((log: any) => {
        try {
          const parsed = this.propertyRegistryContract?.interface.parseLog(log);
          return parsed?.name === "PropertyRequestApproved";
        } catch (e) {
          return false;
        }
      });

      if (event) {
        const parsedEvent = this.propertyRegistryContract?.interface.parseLog(event);
        return Number(parsedEvent?.args.propertyId);
      } else {
        console.warn("PropertyRequestApproved event not found in transaction receipt.");
        return null;
      }
    } catch (error: any) {
      console.error("Failed to approve request:", error);
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to approve request.");
    }
  }

  async rejectRequest(requestId: number): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.propertyRegistryContract || !this.signer) {
      await this.initialize();
    }
    try {
      const gasEstimate = await this.propertyRegistryContract?.rejectRequest.estimateGas(requestId);
      const tx = await this.propertyRegistryContract?.rejectRequest(requestId, { gasLimit: gasEstimate });
      const receipt = await tx.wait();
      console.log("Request rejected:", receipt);
      return receipt;
    } catch (error: any) {
      console.error("Failed to reject request:", error);
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to reject request.");
    }
  }

  async getAllProperties(): Promise<PropertyDetails[]> {
    const count = await this.getPropertyCount();
    if (count === 0) return [];
    const ids = Array.from({ length: count }, (_, i) => i + 1);
    const results = await Promise.all(ids.map((i) => this.getProperty(i)));
    return (results.filter(Boolean) as PropertyData[]).map((property) => ({
      id: property.id,
      name: property.name,
      owner: property.owner,
      partnershipAgreementUrl: property.partnershipAgreementUrl,
      maintenanceAgreementUrl: property.maintenanceAgreementUrl,
      rentAgreementUrl: property.rentAgreementUrl,
      imageUrl: property.imageUrl,
    }));
  }

  async createPropertyRequest(params: CreatePropertyRequestParams): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.propertyRegistryContract || !this.signer) {
      await this.initialize();
    }

    try {
      // Estimate gas before sending the transaction
      const gasEstimate = await this.propertyRegistryContract?.createPropertyRequest.estimateGas(
        params.name,
        params.partnershipAgreementUrl,
        params.maintenanceAgreementUrl,
        params.rentAgreementUrl,
        params.imageUrl,
        params.ownerAddresses,
        params.percentages
      );

      const tx = await this.propertyRegistryContract?.createPropertyRequest(
        params.name,
        params.partnershipAgreementUrl,
        params.maintenanceAgreementUrl,
        params.rentAgreementUrl,
        params.imageUrl,
        params.ownerAddresses,
        params.percentages,
        { gasLimit: gasEstimate }
      );

      const receipt = await tx.wait();
      console.log("Property request created:", receipt);
      return receipt;
    } catch (error: any) {
      console.error("Failed to create property request:", error);

      // Attempt to get a more descriptive error message
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to create property request.");
    }
  }

  async registerProperty(params: RegisterPropertyParams): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.propertyRegistryContract || !this.signer) {
      await this.initialize();
    }

    try {
      // Estimate gas before sending the transaction
      const gasEstimate = await this.propertyRegistryContract?.registerProperty.estimateGas(
        params.name,
        params.owner,
        params.partnershipAgreementUrl,
        params.maintenanceAgreementUrl,
        params.rentAgreementUrl,
        params.imageUrl
      );

      const tx = await this.propertyRegistryContract?.registerProperty(
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
        String(fractionalNFTAddress).toLowerCase(),
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

  async approveFractionalNFTTransfer(
    fractionalNFTAddress: string,
    spender: string,
    amount: number
  ): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.signer) {
      throw new Error("Signer not available. Please connect MetaMask first.");
    }
    try {
      const fractionalNFTContract = new Contract(
        String(fractionalNFTAddress).toLowerCase(),
        CONTRACT_CONFIG.fractionalNFT.abi,
        this.signer
      );
      const tx = await fractionalNFTContract.approve(spender, amount);
      const receipt = await tx.wait();
      console.log("Approval successful:", receipt);
      return receipt;
    } catch (error: any) {
      console.error("Failed to approve fractional NFT transfer:", error);
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to approve fractional NFT transfer.");
    }
  }

  async listFractionalNFTForSale(
    propertyId: number,
    fractionalNFTAddress: string,
    amount: number,
    pricePerShare: number
  ): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.propertyRegistryContract || !this.signer) {
      await this.initialize();
    }
    try {
      const tx = await this.propertyRegistryContract?.listFractionalNFTForSale(
        propertyId,
        fractionalNFTAddress,
        amount,
        pricePerShare,
        { nonce: await this.signer!.getNonce() }
      );
      const receipt = await tx.wait();
      console.log("NFT listed for sale:", receipt);
      return receipt;
    } catch (error: any) {
      console.error("Failed to list NFT for sale:", error);
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to list NFT for sale.");
    }
  }

  async cancelListing(listingId: number): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.propertyRegistryContract || !this.signer) {
      await this.initialize();
    }
    try {
      const tx = await this.propertyRegistryContract?.cancelListing(listingId);
      const receipt = await tx.wait();
      console.log("Listing cancelled:", receipt);
      return receipt;
    } catch (error: any) {
      console.error("Failed to cancel listing:", error);
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to cancel listing.");
    }
  }

  async buyListedFractionalNFT(
    listingId: number,
    amountToBuy: number,
    totalPrice: number
  ): Promise<ethers.ContractTransactionReceipt | null> {
    if (!this.propertyRegistryContract || !this.signer) {
      await this.initialize();
    }
    try {
      const tx = await this.propertyRegistryContract?.buyListedFractionalNFT(
        listingId,
        amountToBuy,
        { value: totalPrice }
      );
      const receipt = await tx.wait();
      console.log("NFT purchased:", receipt);
      return receipt;
    } catch (error: any) {
      console.error("Failed to purchase NFT:", error);
      const reason = await this.getRevertReason(error);
      throw new Error(reason || "Failed to purchase NFT.");
    }
  }

  async getListing(listingId: number): Promise<any | null> {
    if (!this.propertyRegistryContract) await this.initialize();
    try {
      const listing = await this.propertyRegistryContract?.listings(listingId);
      // Assuming the Listing struct returns its members in order
      // struct Listing { uint256 listingId; uint256 propertyId; address fractionalNFTAddress; address seller; uint256 amount; uint256 pricePerShare; ListingStatus status; }
      return {
        listingId: Number(listing[0]),
        propertyId: Number(listing[1]),
        fractionalNFTAddress: listing[2],
        seller: listing[3],
        amount: Number(listing[4]),
        pricePerShare: Number(listing[5]),
        status: Number(listing[6]), // Convert to enum if needed
      };
    } catch (error) {
      console.error(`Failed to get listing ${listingId}:`, error);
      return null;
    }
  }

  async getAllActiveListings(): Promise<any[]> {
    if (!this.propertyRegistryContract) await this.initialize();
    try {
      const activeListings = await this.propertyRegistryContract?.getAllActiveListings();
      return activeListings.map((listing: any) => ({
        listingId: Number(listing[0]),
        propertyId: Number(listing[1]),
        fractionalNFTAddress: listing[2],
        seller: listing[3],
        amount: Number(listing[4]),
        pricePerShare: Number(listing[5]),
        status: Number(listing[6]),
      }));
    } catch (error) {
      console.error("Failed to get all active listings:", error);
      return [];
    }
  }

  private async getRevertReason(error: any): Promise<string | null> {
    if (error.reason) {
      return error.reason;
    }

    let reason: string | null = null;
    if (error.data) {
      try {
        const decodedError = this.propertyRegistryContract?.interface.parseError(error.data);
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
      const fractionalNFTAddress = await this.fractionalizerContract?.fractionalContracts?.(propertyId);
      if (fractionalNFTAddress === ethers.ZeroAddress) return null;

      const fractionalNFTContract = new Contract(
        String(fractionalNFTAddress).toLowerCase(),
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
    if (properties.length === 0) return [];
    
    const detailsList = await Promise.all(properties.map((p) => this.getFractionalNFTDetails(p.id)));
    console.log("Properties:", detailsList);

    const results = await Promise.all(detailsList.map(async (details, idx) => {
      if (!details) return null;
      const fractionalNFTContract = new Contract(
        String(details.address).toLowerCase(),
        CONTRACT_CONFIG.fractionalNFT.abi,
        this.provider
      );
      const balance = await fractionalNFTContract.balanceOf(ownerAddress);
      if (Number(balance) <= 0) return null;
      const property = properties[idx]!;
      return {
        propertyId: property.id,
        propertyName: property.name,
        fractionalNFTAddress: details.address,
        fractionalNFTName: details.name,
        fractionalNFTSymbol: details.symbol,
        totalSupply: details.totalSupply,
        balance: Number(balance),
        percentage: (Number(balance) / details.totalSupply) * 100,
      };
    }));

    return results.filter(Boolean) as any[];
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

  /**
   * Fund a new user account with test ETH from Ganache
   * This uses the first Ganache account as the funding source
   */
  async fundNewUser(userAddress: string, amountInEth: string = "10"): Promise<void> {
    try {
      // Create a provider to the RPC endpoint
      const provider = new ethers.JsonRpcProvider(
        getRpcUrl(),
        undefined,
        {
          staticNetwork: true,
          batchMaxCount: 1,
          fetchOptions: {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }
        } as any
      );

      // Check if user already has funds (skip if balance > 0)
      const balance = await provider.getBalance(userAddress);
      if (balance > 0) {
        console.log(`User ${userAddress} already has ${ethers.formatEther(balance)} ETH`);
        return;
      }

      // Use the funding private key from environment or default Ganache account
      const fundingKey = process.env.NEXT_PUBLIC_FUNDING_PRIVATE_KEY ||
        // Default first Ganache account private key (deterministic)
        "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";

      const fundingSigner = new Wallet(fundingKey, provider);
      
      console.log(`Funding new user ${userAddress} with ${amountInEth} ETH...`);
      
      const tx = await fundingSigner.sendTransaction({
        to: userAddress,
        value: ethers.parseEther(amountInEth),
      });

      await tx.wait();
      console.log(`Successfully funded ${userAddress} with ${amountInEth} ETH`);
    } catch (error) {
      console.error("Failed to fund new user:", error);
      // Don't throw - funding failure shouldn't block login
    }
  }
}

export const blockchainService = new BlockchainService();
