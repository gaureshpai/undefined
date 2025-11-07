'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { Magic } from 'magic-sdk';
import { blockchainService } from './blockchain-service';
import { signupAction, loginAction } from '@/app/actions/auth';

interface User {
  email?: string;
  address?: string;
  role: 'user' | 'admin' | null;
  isConnected: boolean;
  hasPrivateKey?: boolean;
}

interface AuthContextType {
  user: User;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (privateKey: string) => Promise<void>;
  logout: () => void;
  exportPrivateKey: () => Promise<string>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Magic SDK
const createMagic = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY) {
    return new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
  }
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    email: undefined,
    address: undefined,
    role: null,
    isConnected: false,
    hasPrivateKey: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [magic, setMagic] = useState<Magic | null>(null);

  useEffect(() => {
    setMagic(createMagic());
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      // First check for stored private key (for wallet login)
      const storedPrivateKey = localStorage.getItem('wallet_private_key');
      if (storedPrivateKey) {
        try {
          const address = await blockchainService.initialize(storedPrivateKey);
          setUser({
            email: localStorage.getItem('wallet_email') || undefined,
            address,
            role: 'user',
            isConnected: true,
            hasPrivateKey: true,
          });
          return; // Skip Magic check if using private key
        } catch (error) {
          console.error('Failed to restore wallet session:', error);
          localStorage.removeItem('wallet_private_key');
          localStorage.removeItem('wallet_email');
        }
      }

      // Check Magic session
      if (magic) {
        try {
          const isLoggedIn = await magic.user.isLoggedIn();
          if (isLoggedIn) {
            // Use getMetadata for Magic SDK v31
            const metadata = await (magic.user as any).getMetadata();
            const address = await blockchainService.initializeWithMagic(magic);
            setUser({
              email: metadata.email || undefined,
              address,
              role: 'user',
              isConnected: true,
              hasPrivateKey: false,
            });
          }
        } catch (error) {
          console.error('Failed to check user session:', error);
        }
      }
    };
    checkUser();
  }, [magic]);

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // First, register with backend using server action
      const result = await signupAction(email, password);

      if (!result.success) {
        throw new Error(result.error || 'Signup failed');
      }

      // Then login with Magic to create the wallet
      if (!magic) throw new Error('Magic SDK not initialized');
      
      console.log('Magic instance:', magic);
      console.log('Magic user:', magic.user);
      
      // Use Magic Email OTP for authentication
      await magic.auth.loginWithEmailOTP({ email });
      
      // Get user info after successful login
      if (typeof magic.user?.getInfo === 'function') {
        const metadata = await magic.user.getInfo();
        const address = await blockchainService.initializeWithMagic(magic);
        
        setUser({
          email: metadata.email || email,
          address,
          role: 'user',
          isConnected: true,
          hasPrivateKey: false,
        });
      } else {
        // Fallback if getMetadata doesn't exist
        const address = await blockchainService.initializeWithMagic(magic);
        setUser({
          email: email,
          address,
          role: 'user',
          isConnected: true,
          hasPrivateKey: false,
        });
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Verify credentials with backend using server action
      const result = await loginAction(email, password);

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      // Login with Magic to access the wallet
      if (!magic) throw new Error('Magic SDK not initialized');
      
      // Use Magic Email OTP for authentication
      await magic.auth.loginWithEmailOTP({ email });
      
      // Get user info after successful login
      if (typeof magic.user?.getInfo === 'function') {
        const metadata = await magic.user.getInfo();
        const address = await blockchainService.initializeWithMagic(magic);
        
        setUser({
          email: metadata.email || email,
          address,
          role: 'user',
          isConnected: true,
          hasPrivateKey: false,
        });
      } else {
        // Fallback if getMetadata doesn't exist
        const address = await blockchainService.initializeWithMagic(magic);
        setUser({
          email: email,
          address,
          role: 'user',
          isConnected: true,
          hasPrivateKey: false,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (privateKey: string) => {
    setIsLoading(true);
    try {
      const address = await blockchainService.initialize(privateKey);
      const email = localStorage.getItem('wallet_email') || undefined;
      
      // Store private key securely (in production, use better security)
      localStorage.setItem('wallet_private_key', privateKey);
      if (email) {
        localStorage.setItem('wallet_email', email);
      }
      
      setUser({
        email,
        address,
        role: 'user',
        isConnected: true,
        hasPrivateKey: true,
      });
    } catch (error) {
      console.error('Wallet login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const exportPrivateKey = async (): Promise<string> => {
    if (!magic) throw new Error('Magic SDK not initialized');
    try {
      // Export private key from Magic wallet
      const privateKey = (await magic.user.revealEVMPrivateKey()) || "";

      console.log(magic.user);

      // Store for future wallet logins
      localStorage.setItem("wallet_private_key", String(privateKey));
      if (user.email) {
        localStorage.setItem("wallet_email", user.email);
      }

      setUser((prev) => ({ ...prev, hasPrivateKey: true }));
      return String(privateKey);
    } catch (error) {
      console.error('Failed to export private key:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (magic) {
      try {
        await magic.user.logout();
      } catch (error) {
        console.error('Magic logout failed:', error);
      }
    }
    
    // Clear wallet data
    localStorage.removeItem('wallet_private_key');
    localStorage.removeItem('wallet_email');
    
    setUser({
      email: undefined,
      address: undefined,
      role: null,
      isConnected: false,
      hasPrivateKey: false,
    });
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, loginWithWallet, logout, exportPrivateKey, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
