"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface User {
  address?: string;
  role: "user" | "admin" | null;
  isConnected: boolean;
}

interface AuthContextType {
  user: User;
  loginWithMetaMask: () => Promise<void>;
  adminLogin: (password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    address: undefined,
    role: null,
    isConnected: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Admin password (in production, use proper authentication)
  const ADMIN_PASSWORD = "admin@123";

  const checkMetaMaskConnection = useCallback(async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setUser({
            address: accounts[0],
            role: "user",
            isConnected: true,
          });
        }
      } catch (error) {
        console.error("Failed to check MetaMask connection:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Check if user was previously connected
    checkMetaMaskConnection();
  }, [checkMetaMaskConnection]);

  const loginWithMetaMask = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Please install MetaMask");
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setUser({
          address: accounts[0],
          role: "user",
          isConnected: true,
        });
      }
    } catch (error) {
      console.error("MetaMask login failed:", error);
      alert("Failed to connect MetaMask");
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setUser({
        address: "admin",
        role: "admin",
        isConnected: true,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser({
      address: undefined,
      role: null,
      isConnected: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loginWithMetaMask, adminLogin, logout, isLoading }}
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
