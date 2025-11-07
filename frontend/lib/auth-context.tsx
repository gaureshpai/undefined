"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { blockchainService } from "./blockchain-service";
import type { Signer } from "ethers";

interface User {
  address?: string;
  role: "user" | "admin" | null;
  isConnected: boolean;
}

interface AuthContextType {
  user: User;
  loginWithPrivateKey: (privateKey: string, role: "user" | "admin") => Promise<void>;
  adminLogin: (password: string) => Promise<boolean>;
  logout: () => void;
  loginWithMetaMask: () => Promise<void>;
  isLoading: boolean;
  signer: Signer | null; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    address: undefined,
    role: null,
    isConnected: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const ADMIN_PASSWORD = "admin@123";
  const ADMIN_PRIVATE_KEY = "0xde6ea022157f9fe8d2f4b1aff42ea0d7aa44e0c6d814119546d8fd0e2ff4ae49"; // Example private key for admin

  useEffect(() => {
    // Check if admin was previously logged in
    if (typeof window !== 'undefined') {
      const isAdmin = localStorage.getItem("isAdmin");
      if (isAdmin === "true") {
        // Re-login with private key to get the actual address
        loginWithPrivateKey(ADMIN_PRIVATE_KEY, "admin");
      }
    }
  }, []);

  const loginWithPrivateKey = async (privateKey: string, role: "user" | "admin") => {
    setIsLoading(true);
    try {
      const address = await blockchainService.initialize(privateKey);
      setUser({
        address: address,
        role: role,
        isConnected: true,
      });
      if (role === "admin") {
        if (typeof window !== 'undefined') {
          localStorage.setItem("isAdmin", "true");
        }
      }
    } catch (error) {
      console.error(`${role} login failed:`, error);
      alert(`Failed to connect to local blockchain network with provided private key.`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  const adminLogin = async(password: string): Promise<boolean> => {
    if (password === ADMIN_PASSWORD) {
      // For admin, we'll assume a predefined private key for local development
      const ADMIN_PRIVATE_KEY = "0x82189d8341245824960d24eea73ab1f905bae1f7d14e58da71e285456cbac4bd"; // Example private key
      await loginWithPrivateKey(ADMIN_PRIVATE_KEY, "admin");
      localStorage.setItem("isAdmin", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("isAdmin");
    setUser({
      address: undefined,
      role: null,
      isConnected: false,
    });
  };

  const loginWithMetaMask = async () => {
    setIsLoading(true);
    try {
      const address = await blockchainService.connectMetaMask();
      setUser({
        address: address,
        role: "user", // Default to user role for MetaMask login
        isConnected: true,
      });
    } catch (error) {
      console.error("MetaMask login failed:", error);
      alert(`Failed to connect to MetaMask: ${error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loginWithPrivateKey, adminLogin, logout, loginWithMetaMask, isLoading, signer: blockchainService.getSigner() }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
