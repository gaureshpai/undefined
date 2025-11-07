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

export default function AssetTransferModal({ ownedNFT }: { ownedNFT: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!recipientAddress || amount <= 0) {
      setError("Please enter a valid recipient address and amount.");
      return;
    }

    setIsTransferring(true);
    setError("");

    try {
      await blockchainService.transferFractionalNFT(
        ownedNFT.fractionalNFTAddress,
        recipientAddress,
        amount
      );
      alert("Transfer successful!");
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to transfer asset.");
    } finally {
      setIsTransferring(false);
    }
  };

  // Hide transfer if no signer available (wallet features disabled for users)
  if (!blockchainService.getSigner()) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>Transfer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Transfer Asset</DialogTitle>
          <DialogDescription className="text-slate-400">
            Transfer your fractional ownership of {ownedNFT.propertyName} to another user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            <Label htmlFor="amount" className="text-right text-slate-300">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3 bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleTransfer} disabled={isTransferring} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isTransferring ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
