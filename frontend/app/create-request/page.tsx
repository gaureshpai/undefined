"use client"

import CreateBuildingForm from "@/components/admin/create-building-form"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CreateRequestPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user.isConnected) {
      router.push("/")
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Asset Token Request</h2>
          <p className="text-slate-400 text-sm">
            Fill out the form below to submit a request to tokenize a new building asset.
          </p>
        </div>
        <CreateBuildingForm />
      </div>
    </div>
  )
}
