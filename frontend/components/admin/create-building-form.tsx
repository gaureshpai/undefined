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
  }[]>([{ address: "", percentage: 0 }]);
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
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="text-white">Create New Tokenized Asset</CardTitle>
        <CardDescription>
          Register a building and create its digital token representation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <FileCheck className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                Building asset created successfully! Token created and pending
                approval.
              </AlertDescription>
            </Alert>
          ) && toast.success("Building asset created successfully! Token created and pending approval.")}

          {errorMsg && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          {/* Asset Information */}
          <div className="space-y-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <h3 className="text-white font-semibold">Asset Information</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Building Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Downtown Office Complex"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-slate-700/50 border-slate-600 text-white"
                required
              />
            </div>

            </div>

            {/* Owners and Percentages */}
            <div className="space-y-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
              <h3 className="text-white font-semibold">Owners and Percentages (Total must be 100%)</h3>
              {owners.map((owner, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-grow space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Owner {index + 1} Wallet Address *
                    </label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={owner.address}
                      onChange={(e) =>
                        handleOwnerChange(index, "address", e.target.value)
                      }
                      className="bg-slate-700/50 border-slate-600 text-white font-mono text-xs"
                      required
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <label className="text-sm font-medium text-slate-200">
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
                      className="bg-slate-700/50 border-slate-600 text-white"
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
              <Button type="button" onClick={addOwner} className="w-full bg-slate-600 hover:bg-slate-500 text-white">
                Add Another Owner
              </Button>
              <p className="text-sm text-slate-400 mt-2">
                Total Percentage: {owners.reduce((sum, owner) => sum + owner.percentage, 0) / 100}%
              </p>
            </div>

            {/* Document Uploads */}
          <div className="space-y-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <h3 className="text-white font-semibold">Required Documents</h3>

            {/* Partnership Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
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
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {files.partnershipAgreement
                      ? files.partnershipAgreement.name
                      : "Upload partnership agreement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Maintenance Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
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
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {files.maintenanceAgreement
                      ? files.maintenanceAgreement.name
                      : "Upload maintenance agreement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Rent Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
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
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {files.rentAgreement
                      ? files.rentAgreement.name
                      : "Upload rent agreement"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <h3 className="text-white font-semibold">Property Image</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
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
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {files.imageFile ? files.imageFile.name : "Upload property image"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold h-12 rounded-lg transition-all"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Create Asset Token"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}