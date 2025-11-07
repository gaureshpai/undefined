"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const router = useRouter();
  const { user, loginWithPrivateKey, adminLogin, isLoading } = useAuth();
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [userPrivateKey, setUserPrivateKey] = useState("");
  const [userError, setUserError] = useState("");
  const [activeTab, setActiveTab] = useState("user");

  useEffect(() => {
    if (user.isConnected) {
      router.push(user.role === "admin" ? "/admin" : "/portfolio");
    }
  }, [user, router]);

  const handleUserLogin = async () => {
    setUserError("");
    if (!userPrivateKey) {
      setUserError("Please enter your private key.");
      return;
    }
    try {
      await loginWithPrivateKey(userPrivateKey, "user");
      router.push("/portfolio");
    } catch (error) {
      setUserError(
        "Login failed. Please check your private key and try again."
      );
      setUserPrivateKey("");
    }
  };

  const handleAdminLogin = async () => {
    setAdminError("");
    if (!adminPassword) {
      setAdminError("Please enter the admin password.");
      return;
    }
    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY ||
      "0xde6ea022157f9fe8d2f4b1aff42ea0d7aa44e0c6d814119546d8fd0e2ff4ae49"; // Example private key for admin
    try {
      const success = await adminLogin(adminPassword);
      if (success) {
        await loginWithPrivateKey(ADMIN_PRIVATE_KEY, "admin");
        router.push("/admin");
      } else {
        setAdminError("Invalid password. Please try again.");
        setAdminPassword("");
      }
    } catch (error) {
      setAdminError(
        "Admin login failed. Please check your password and try again."
      );
      setAdminPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-black opacity-50"></div>
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AssetChain</h1>
          <p className="text-slate-400">Tokenized Asset Management</p>
        </div>

        <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-lg shadow-2xl shadow-blue-500/10">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white">Login</CardTitle>
            <CardDescription>
              Choose your login method to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 rounded-md p-1">
                <TabsTrigger
                  value="user"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 rounded-sm transition-all duration-200"
                >
                  User
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 rounded-sm transition-all duration-200"
                >
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* User Login Tab */}
              <TabsContent value="user" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 text-center mb-4">
                    Enter your private key to access your portfolio
                  </p>

                  {userError && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-400">
                        {userError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Private Key
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your private key (e.g., 0x...)"
                      value={userPrivateKey}
                      onChange={(e) => {
                        setUserPrivateKey(e.target.value);
                        setUserError("");
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleUserLogin();
                        }
                      }}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <Button
                    onClick={handleUserLogin}
                    disabled={isLoading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-12 rounded-lg transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="w-6 h-6" />
                        <span>Login with Private Key</span>
                      </div>
                    )}
                  </Button>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-xs text-blue-400">
                      💡 For local development, you can use private keys from
                      your Hardhat node (e.g., `npx hardhat node`).
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Admin Login Tab */}
              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 text-center mb-4">
                    Admin only. Enter your password to continue
                  </p>

                  {adminError && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-400">
                        {adminError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Admin Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setAdminError("");
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAdminLogin();
                        }
                      }}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <Button
                    onClick={handleAdminLogin}
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold h-12 rounded-lg transition-all shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-6 h-6" />
                      <span>Login as Admin</span>
                    </div>
                  </Button>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-xs text-amber-400">
                      🔐 Admin dashboard provides access to building creation,
                      management, and request approval features.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
