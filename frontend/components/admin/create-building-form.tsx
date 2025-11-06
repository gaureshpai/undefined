"use client"

import type React from "react"

import { useState } from "react"
import { useAssetStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileCheck, AlertCircle } from "lucide-react"
import type { BuildingAsset } from "@/lib/asset-data"

interface FileUpload {
  partnershipAgreement: File | null
  maintenanceAgreement: File | null
  rentAgreement: File | null
}

export default function CreateBuildingForm() {
  const { addBuilding } = useAssetStore()
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    ownerAddress: "",
    ownershipPercentage: 100,
  })
  const [files, setFiles] = useState<FileUpload>({
    partnershipAgreement: null,
    maintenanceAgreement: null,
    rentAgreement: null,
  })
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof FileUpload) => {
    if (e.target.files?.[0]) {
      setFiles((prev) => ({
        ...prev,
        [fileType]: e.target.files![0],
      }))
      setErrorMsg("")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ownershipPercentage" ? Number.parseFloat(value) : value,
    }))
  }

  const generateTokenId = () => {
    return `TOKEN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  const generateBuildingId = () => {
    return `BLD-${Date.now()}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccess(false)

    // Validation
    if (!formData.name || !formData.location || !formData.ownerAddress) {
      setErrorMsg("Please fill in all required fields")
      return
    }

    if (!files.partnershipAgreement || !files.maintenanceAgreement || !files.rentAgreement) {
      setErrorMsg("Please upload all required documents")
      return
    }

    if (formData.ownershipPercentage <= 0 || formData.ownershipPercentage > 100) {
      setErrorMsg("Ownership percentage must be between 0 and 100")
      return
    }

    // Create new building asset
    const newBuilding: BuildingAsset = {
      id: generateBuildingId(),
      name: formData.name,
      location: formData.location,
      owner: formData.ownerAddress,
      tokenId: generateTokenId(),
      files: {
        partnershipAgreement: files.partnershipAgreement.name,
        maintenanceAgreement: files.maintenanceAgreement.name,
        rentAgreement: files.rentAgreement.name,
      },
      createdAt: new Date().toISOString(),
      status: "pending",
      fractionalOwnership: [
        {
          address: formData.ownerAddress,
          percentage: formData.ownershipPercentage,
        },
      ],
    }

    addBuilding(newBuilding)
    setSuccess(true)
    setFormData({
      name: "",
      location: "",
      ownerAddress: "",
      ownershipPercentage: 100,
    })
    setFiles({
      partnershipAgreement: null,
      maintenanceAgreement: null,
      rentAgreement: null,
    })

    setTimeout(() => setSuccess(false), 5000)
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="text-white">Create New Tokenized Asset</CardTitle>
        <CardDescription>Register a building and create its digital token representation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <FileCheck className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                Building asset created successfully! Token created and pending approval.
              </AlertDescription>
            </Alert>
          )}

          {errorMsg && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Asset Information */}
          <div className="space-y-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <h3 className="text-white font-semibold">Asset Information</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Building Name *</label>
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
              <label className="text-sm font-medium text-slate-200">Location *</label>
              <Input
                type="text"
                name="location"
                placeholder="e.g., Manhattan, NY"
                value={formData.location}
                onChange={handleInputChange}
                className="bg-slate-700/50 border-slate-600 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Owner Wallet Address *</label>
                <Input
                  type="text"
                  name="ownerAddress"
                  placeholder="0x..."
                  value={formData.ownerAddress}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600 text-white font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Ownership % *</label>
                <Input
                  type="number"
                  name="ownershipPercentage"
                  placeholder="100"
                  min="1"
                  max="100"
                  value={formData.ownershipPercentage}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <h3 className="text-white font-semibold">Required Documents</h3>

            {/* Partnership Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Partnership Agreement *</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "partnershipAgreement")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {files.partnershipAgreement ? files.partnershipAgreement.name : "Upload partnership agreement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Maintenance Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Maintenance Agreement *</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "maintenanceAgreement")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {files.maintenanceAgreement ? files.maintenanceAgreement.name : "Upload maintenance agreement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Rent Agreement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Rent Agreement *</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "rentAgreement")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {files.rentAgreement ? files.rentAgreement.name : "Upload rent agreement"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold h-12 rounded-lg transition-all"
          >
            Create Asset Token
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
