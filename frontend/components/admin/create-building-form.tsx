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

interface FileUpload {
  partnershipAgreement: File | null;
  maintenanceAgreement: File | null;
  rentAgreement: File | null;
  imageFile: File | null;
}

export default function CreateBuildingForm() {
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!formData.name || !formData.owner) {
      setErrorMsg("Please fill in all required fields");
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

      await blockchainService.registerProperty({
        name: formData.name,
        owner: formData.owner,
        partnershipAgreementUrl,
        maintenanceAgreementUrl,
        rentAgreementUrl,
        imageUrl
      });

      setSuccess(true);
      setFormData({
        name: "",
        owner: "",
      });
      setFiles({
        partnershipAgreement: null,
        maintenanceAgreement: null,
        rentAgreement: null,
        imageFile: null,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register property on blockchain.");
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
          )}

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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Owner Wallet Address *
              </label>
              <Input
                type="text"
                name="owner"
                placeholder="0x..."
                value={formData.owner}
                onChange={handleInputChange}
                className="bg-slate-700/50 border-slate-600 text-white font-mono text-xs"
                required
              />
            </div>
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