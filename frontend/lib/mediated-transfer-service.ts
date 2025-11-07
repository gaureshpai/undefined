import { ethers, Provider } from "ethers";
import { contractConfig } from "./contract-config";
import MediatedTransfer from "../contracts/MediatedTransfer.json";
import { blockchainService } from "./blockchain-service";

export interface MediatedTransferProposal {
  id: string; // propertyId as string
  propertyId: number;
  mediator: string;
  nextOwners: string[]; // Added to store the proposed new owners
  isApprovedByMediator: boolean;
  isExecuted: boolean;
  ownerApprovals: { [ownerAddress: string]: boolean }; // New field for owner voting
  status: "pending" | "approved" | "rejected" | "executed";
  createdAt: string;
}

const mediatedTransferAddress = contractConfig.mediatedTransferAddress;
const mediatedTransferABI = MediatedTransfer.abi;

const getMediatedTransferContract = (signerOrProvider: ethers.Signer | Provider) => {
  return new ethers.Contract(mediatedTransferAddress, mediatedTransferABI, signerOrProvider);
};

export const proposeTransfer = async (signer: ethers.Signer, propertyId: number, mediator: string, nextOwners: string[]) => {
  const contract = getMediatedTransferContract(signer);
  const tx = await contract.proposeTransfer(propertyId, mediator, nextOwners);
  await tx.wait();
  return { success: true, message: `Transfer proposal for property ${propertyId} submitted.` };
};

export const approveTransfer = async (signer: ethers.Signer, propertyId: number) => {
  const contract = getMediatedTransferContract(signer);
  const tx = await contract.approveTransfer(propertyId);
  await tx.wait();
  return { success: true, message: `Transfer for property ${propertyId} approved by owner.` };
};

export const approveTransferByMediator = async (signer: ethers.Signer, propertyId: number) => {
  const contract = getMediatedTransferContract(signer);
  const tx = await contract.approveTransferByMediator(propertyId);
  await tx.wait();
  return { success: true, message: `Transfer for property ${propertyId} approved by mediator.` };
};

export const executeTransfer = async (signer: ethers.Signer, propertyId: number) => {
  const contract = getMediatedTransferContract(signer);
  const tx = await contract.executeTransfer(propertyId);
  await tx.wait();
  return { success: true, message: `Transfer for property ${propertyId} executed.` };
};

export const rejectTransfer = async (signer: ethers.Signer, propertyId: number) => {
  const contract = getMediatedTransferContract(signer);
  const tx = await contract.rejectTransfer(propertyId);
  await tx.wait();
  return { success: true, message: `Transfer for property ${propertyId} rejected.` };
};

export const getMediatedTransferProposals = async (provider: Provider): Promise<MediatedTransferProposal[]> => {
  const contract = getMediatedTransferContract(provider);
  const proposals: { [propertyId: number]: MediatedTransferProposal } = {};

  // Fetch TransferProposed events
  const transferProposedEvents = await contract.queryFilter(
    contract.filters.TransferProposed()
  );

  for (const event of transferProposedEvents) {
        if ('args' in event) {
          const propertyId = Number(event.args.propertyId);
          const mediator = event.args.mediator;
          const block = await provider.getBlock(event.blockNumber);
          const createdAt = block ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString();

          // Fetch full proposal details from the contract
          const proposalDetails = await contract.transferProposals(propertyId);
          const nextOwners = proposalDetails.nextOwners; // Assuming nextOwners is part of the proposalDetails struct
          const isApprovedByMediator = proposalDetails.isApprovedByMediator;
          const isExecuted = proposalDetails.isExecuted;

          // Fetch current owners from PropertyRegistry
          await blockchainService.initialize(); // Ensure blockchainService is initialized
          const propertyDetails = await blockchainService.getPropertyDetails(propertyId);
          const currentOwners = propertyDetails?.owners || [];

          const ownerApprovals: { [ownerAddress: string]: boolean } = {};
          let allOwnersApproved = true;
          for (const owner of currentOwners) {
            const approved = await contract.approvals(propertyId, owner.wallet);
            ownerApprovals[owner.wallet] = approved;
            if (!approved) {
              allOwnersApproved = false;
            }
          }

          let status: MediatedTransferProposal["status"] = "pending";
          if (isExecuted) {
            status = "executed";
          } else if (isApprovedByMediator && allOwnersApproved) {
            status = "approved"; // Both mediator and all owners have approved
          } else if (isApprovedByMediator) {
            status = "pending"; // Mediator approved, but not all owners
          } else if (allOwnersApproved) {
            status = "pending"; // All owners approved, but not mediator
          }

          proposals[propertyId] = {
            id: propertyId.toString(),
            propertyId,
            mediator,
            nextOwners,
            isApprovedByMediator,
            isExecuted,
            ownerApprovals,
            status,
            createdAt,
          };
        }
      }

  // Filter out executed proposals. Rejection status is not explicitly stored on-chain in the proposal struct.
  return Object.values(proposals).filter(p => p.status !== "executed");
};

