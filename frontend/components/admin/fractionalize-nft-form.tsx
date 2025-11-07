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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileCheck, AlertCircle } from "lucide-react";
import {toast} from "sonner";

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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Fractionalize NFT</CardTitle>
        <CardDescription>
          Create fractional tokens for this property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert variant="default">
              <FileCheck className="h-4 w-4" />
              <AlertDescription>
                NFT fractionalized successfully!
              </AlertDescription>
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Token Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Downtown Office Fractions"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Token Symbol *
              </label>
              <Input
                type="text"
                name="symbol"
                placeholder="e.g., DOF"
                value={formData.symbol}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Total Supply *
              </label>
              <Input
                type="number"
                name="totalSupply"
                placeholder="e.g., 10000"
                value={formData.totalSupply}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Fractionalizing..." : "Fractionalize NFT"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
