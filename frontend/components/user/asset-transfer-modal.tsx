"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockchainService } from "@/lib/blockchain-service";
import { OwnedFractionalNFT } from "@/lib/contract-types";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { CONTRACT_CONFIG } from "@/lib/contract-config";
import { ethers } from "ethers";

export default function AssetTransferModal({ ownedNFT }: { ownedNFT: OwnedFractionalNFT }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);

  const [isListingMode, setIsListingMode] = useState(false);
  const [listAmount, setListAmount] = useState(0);
  const [pricePerShare, setPricePerShare] = useState(0);
  const [isListing, setIsListing] = useState(false);

  const [error, setError] = useState("");

  const handleTransfer = async () => {
    if (!recipientAddress || transferAmount <= 0) {
      setError("Please enter a valid recipient address and amount.");
      return;
    }
    if (transferAmount > ownedNFT.balance) {
      setError("Transfer amount exceeds your current balance.");
      return;
    }

    setIsTransferring(true);
    setError("");

    try {
      await blockchainService.transferFractionalNFT(
        ownedNFT.fractionalNFTAddress,
        recipientAddress,
        transferAmount
      );
      toast.success("Transfer successful!");
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to transfer asset.");
      toast.error(err.message || "Failed to transfer asset.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleListForSale = async () => {
    if (listAmount <= 0 || pricePerShare <= 0) {
      setError("Please enter valid amount and price per share.");
      return;
    }
    if (listAmount > ownedNFT.balance) {
      setError("Listing amount exceeds your current balance.");
      return;
    }

    setIsListing(true);
    setError("");

    try {
      // First, approve the PropertyRegistry contract to spend the fractional NFT tokens
      await blockchainService.approveFractionalNFTTransfer(
        ownedNFT.fractionalNFTAddress,
        CONTRACT_CONFIG.propertyRegistry.address,
        listAmount
      );
      console.log("Approval successful. Now listing NFT...");

      // Then, list the NFT for sale
      await blockchainService.listFractionalNFTForSale(
        ownedNFT.propertyId,
        ownedNFT.fractionalNFTAddress,
        listAmount,
        pricePerShare // Convert price to WEI
      );
      console.log("NFT listed for sale successfully!");
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to list NFT for sale.");
      toast.error(err.message || "Failed to list NFT for sale.");
    } finally {
      setIsListing(false);
    }
  };

  // Hide transfer if no signer available (wallet features disabled for users)
  if (!blockchainService.getSigner()) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <div className="flex space-x-2">
          <Button size="sm">Transfer</Button>
          <Button size="sm" variant="secondary">List to Marketplace</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isListingMode ? "List Asset for Sale" : "Transfer Asset"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isListingMode
              ? `List your fractional ownership of ${ownedNFT.propertyName} on the marketplace.`
              : `Transfer your fractional ownership of ${ownedNFT.propertyName} to another user.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-2">
          <Switch
            id="listing-mode"
            checked={isListingMode}
            onCheckedChange={setIsListingMode}
            className="data-[state=checked]:bg-blue-600"
          />
          <Label htmlFor="listing-mode" className="text-slate-300">
            List to Marketplace
          </Label>
        </div>
        <div className="grid gap-4 py-4">
          {isListingMode ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="list-amount" className="text-right text-slate-300">
                  Amount to List
                </Label>
                <Input
                  id="list-amount"
                  type="number"
                  value={listAmount}
                  onChange={(e) => setListAmount(Number(e.target.value))}
                  className="col-span-3 bg-slate-700/50 border-slate-600 text-white"
                  min="0"
                  max={ownedNFT.balance}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price-per-share" className="text-right text-slate-300">
                  Price per Share (ETH)
                </Label>
                <Input
                  id="price-per-share"
                  type="number"
                  value={pricePerShare}
                  onChange={(e) => setPricePerShare(Number(e.target.value))}
                  className="col-span-3 bg-slate-700/50 border-slate-600 text-white"
                  min="0"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipient" className="text-right text-slate-300">
                  Recipient Address
                </Label>
                <Input
                  id="recipient"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="col-span-3 bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transfer-amount" className="text-right text-slate-300">
                  Amount
                </Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="col-span-3 bg-slate-700/50 border-slate-600 text-white"
                  min="0"
                  max={ownedNFT.balance}
                />
              </div>
            </>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          {isListingMode ? (
            <Button type="button" onClick={handleListForSale} disabled={isListing} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isListing ? "Listing..." : "List for Sale"}
            </Button>
          ) : (
            <Button type="button" onClick={handleTransfer} disabled={isTransferring} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isTransferring ? "Transferring..." : "Transfer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
