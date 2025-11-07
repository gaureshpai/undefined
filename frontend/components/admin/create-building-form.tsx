"use client";

import type React from "react";

import { useState } from "react";
import { blockchainService } from "@/lib/blockchain-service";

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
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { uploadFileToAzure } from "@/lib/azure-blob-storage";
import {toast} from "sonner";

interface FileUpload {
  partnershipAgreement: File | null;
  maintenanceAgreement: File | null;
  rentAgreement: File | null;
  imageFile: File | null;
}

export default function CreateBuildingForm() {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [owners, setOwners] = useState<{
    address: string;
    percentage: number;
  }[]>([{ address: "", percentage: 100 }]);
  const [files, setFiles] = useState<FileUpload>({
    partnershipAgreement: null,
    maintenanceAgreement: null,
    rentAgreement: null,
    imageFile: null,
  });
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: keyof FileUpload
  ) => {
    if (e.target.files?.[0]) {
      setFiles((prev) => ({
        ...prev,
        [fileType]: e.target.files![0],
      }));
      setErrorMsg("");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOwnerChange = (
    index: number,
    field: "address" | "percentage",
    value: string | number
  ) => {
    const newOwners = [...owners];
    if (field === "percentage") {
      newOwners[index][field] = Number(value);
    } else {
      newOwners[index][field] = value as string;
    }
    setOwners(newOwners);
  };

  const addOwner = () => {
    setOwners([...owners, { address: "", percentage: 0 }]);
  };

  const removeOwner = (index: number) => {
    const newOwners = owners.filter((_, i) => i !== index);
    setOwners(newOwners);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!formData.name) {
      setErrorMsg("Please fill in the building name.");
      return;
    }

    if (owners.length === 0) {
      setErrorMsg("At least one owner is required.");
      return;
    }

    const ownerAddresses: string[] = [];
    const percentages: number[] = [];
    let totalPercentage = 0;

    for (const owner of owners) {
      if (!owner.address) {
        setErrorMsg("All owner addresses must be filled.");
        return;
      }
      if (owner.percentage <= 0) {
        setErrorMsg("All owner percentages must be greater than 0.");
        return;
      }
      ownerAddresses.push(owner.address);
      percentages.push(owner.percentage);
      totalPercentage += owner.percentage;
    }

    if (totalPercentage !== 10000) {
      setErrorMsg("Total percentage for owners must equal 100% (10000 basis points).");
      return;
    }

    if (
      !files.partnershipAgreement ||
      !files.maintenanceAgreement ||
      !files.rentAgreement ||
      !files.imageFile
    ) {
      setErrorMsg("Please upload all required documents and an image");
      return;
    }

    setUploading(true);

    try {
      const partnershipAgreementUrl = await uploadFileToAzure(files.partnershipAgreement);
      const maintenanceAgreementUrl = await uploadFileToAzure(files.maintenanceAgreement);
      const rentAgreementUrl = await uploadFileToAzure(files.rentAgreement);
      const imageUrl = await uploadFileToAzure(files.imageFile);

      await blockchainService.createPropertyRequest({
        name: formData.name,
        partnershipAgreementUrl,
        maintenanceAgreementUrl,
        rentAgreementUrl,
        imageUrl,
        ownerAddresses,
        percentages,
      });

      setSuccess(true);
      setFormData({
        name: "",
      });
      setOwners([{ address: "", percentage: 0 }]);
      setFiles({
        partnershipAgreement: null,
        maintenanceAgreement: null,
        rentAgreement: null,
        imageFile: null,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create property request on blockchain.");
      toast.error(err.message || "Failed to create property request on blockchain.");
    }
    finally {
      setUploading(false);
    }

    setTimeout(() => setSuccess(false), 5000);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Tokenized Asset</CardTitle>
        <CardDescription>
          Register a building and create its digital token representation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert variant="default">
              <FileCheck className="h-4 w-4" />
              <AlertDescription>
                Building asset created successfully! Token created and pending
                approval.
              </AlertDescription>
            </Alert>
          ) && toast.success("Building asset created successfully! Token created and pending approval.")}

          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          {/* Asset Information */}
          <div className="space-y-4 p-4 rounded-lg border">
            <h3 className="font-semibold">Asset Information</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Building Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Downtown Office Complex"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            </div>

            {/* Owners and Percentages */}
            <div className="space-y-4 p-4 rounded-lg border">
              <h3 className="font-semibold">Owners and Percentages (Total must be 100%)</h3>
              {owners.map((owner, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="grow space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Owner {index + 1} Wallet Address *
                    </label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={owner.address}
                      onChange={(e) =>
                        handleOwnerChange(index, "address", e.target.value)
                      }
                      className="font-mono text-xs"
                      required
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Percentage (%) *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="e.g., 50"
                      value={owner.percentage / 100} // Display as percentage, but store as basis points
                      onChange={(e) =>
                        handleOwnerChange(index, "percentage", Number(e.target.value) * 100)
                      }
                      required
                    />
                  </div>
                  {owners.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeOwner(index)}
                      className="h-10 w-10 p-0"
                    >
                      -
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={addOwner} variant="secondary" className="w-full">
                Add Another Owner
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Total Percentage: {owners.reduce((sum, owner) => sum + owner.percentage, 0) / 100}%
              </p>
            </div>

            {/* Document Uploads */}
          <div className="space-y-4 p-4 rounded-lg border">
            <h3 className="font-semibold">Required Documents</h3>

            {/* Partnership Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Partnership Agreement *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "partnershipAgreement")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  // required
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg bg-input hover:bg-accent transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {files.partnershipAgreement
                      ? files.partnershipAgreement.name
                      : "Upload partnership agreement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Maintenance Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Maintenance Agreement *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "maintenanceAgreement")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  // required
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg bg-input hover:bg-accent transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {files.maintenanceAgreement
                      ? files.maintenanceAgreement.name
                      : "Upload maintenance agreement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Rent Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Rent Agreement *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "rentAgreement")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  // required
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg bg-input hover:bg-accent transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {files.rentAgreement
                      ? files.rentAgreement.name
                      : "Upload rent agreement"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4 p-4 rounded-lg border">
            <h3 className="font-semibold">Property Image</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Upload Property Image *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  onChange={(e) => handleFileUpload(e, "imageFile")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg bg-input hover:bg-accent transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {files.imageFile ? files.imageFile.name : "Upload property image"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-lg"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Create Asset Token"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}