"use client";

import type React from "react";
import { useState } from "react";
import { useAssetStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileCheck, AlertCircle } from "lucide-react";

export default function FractionalizeNftForm({ propertyId }: { propertyId: number }) {
  const { fractionalizeNFT } = useAssetStore();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    totalSupply: 0,
  });
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!formData.name || !formData.symbol || !formData.totalSupply) {
      setErrorMsg("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      await fractionalizeNFT(
        propertyId,
        formData.name,
        formData.symbol,
        formData.totalSupply
      );

      setSuccess(true);
      setFormData({
        name: "",
        symbol: "",
        totalSupply: 0,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fractionalize NFT.");
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg mt-6">
      <CardHeader>
        <CardTitle className="text-white">Fractionalize NFT</CardTitle>
        <CardDescription>
          Create fractional tokens for this property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <FileCheck className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                NFT fractionalized successfully!
              </AlertDescription>
            </Alert>
          )}

          {errorMsg && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Token Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Downtown Office Fractions"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-slate-700/50 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Token Symbol *
              </label>
              <Input
                type="text"
                name="symbol"
                placeholder="e.g., DOF"
                value={formData.symbol}
                onChange={handleInputChange}
                className="bg-slate-700/50 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Total Supply *
              </label>
              <Input
                type="number"
                name="totalSupply"
                placeholder="e.g., 10000"
                value={formData.totalSupply}
                onChange={handleInputChange}
                className="bg-slate-700/50 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12 rounded-lg transition-all"
            disabled={isLoading}
          >
            {isLoading ? "Fractionalizing..." : "Fractionalize NFT"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
