'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Magic } from 'magic-sdk';
import { blockchainService } from './blockchain-service';

interface User {
  email?: string;
  address?: string;
  role: 'user' | 'admin' | null;
  isConnected: boolean;
}

interface AuthContextType {
  user: User;
  authenticate: (email: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // Kept for compatibility; will throw if called
  exportPrivateKey?: () => Promise<string>;
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [magic, setMagic] = useState<Magic | null>(null);

  useEffect(() => {
    setMagic(createMagic());
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      if (!magic) return;
      try {
        const isLoggedIn = await magic.user.isLoggedIn();
        if (isLoggedIn) {
          const info = await (magic.user as any).getInfo();
          if (info?.email) {
            // Initialize EVM wallet via Magic and get the address
            const address = await blockchainService.initializeWithMagic(magic);
            const adminList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase();
            const isAdmin = adminList.split(',').map(s=>s.trim()).filter(Boolean).includes(info.email.toLowerCase());
            const next = {
              email: info.email,
              address,
              role: isAdmin ? 'admin' : 'user',
              isConnected: true,
            } as User;
            setUser(prev => {
              if (
                prev.email === next.email &&
                prev.address === next.address &&
                prev.role === next.role &&
                prev.isConnected === next.isConnected
              ) {
                return prev;
              }
              return next;
            });
          }
        }
      } catch (error) {
        console.error('Failed to check user session:', error);
      }
    };
    checkUser();
  }, [magic]);

  const authenticate = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      if (!magic) throw new Error('Magic SDK not initialized');
      // Passwordless: send magic link to email
      await magic.auth.loginWithEmailOTP({ email });

      // Initialize EVM wallet via Magic and get the address
      const address = await blockchainService.initializeWithMagic(magic);
      const adminList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase();
      const isAdmin = adminList.split(',').map(s=>s.trim()).filter(Boolean).includes(email.toLowerCase());
      const next = {
        email,
        address,
        role: isAdmin ? 'admin' : 'user',
        isConnected: true,
      } as User;
      setUser(prev => {
        if (
          prev.email === next.email &&
          prev.address === next.address &&
          prev.role === next.role &&
          prev.isConnected === next.isConnected
        ) {
          return prev;
        }
        return next;
      });
    } catch (error) {
      console.error('Authentication via OTP failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [magic]);

  const exportPrivateKey = async (): Promise<string> => {
    throw new Error('Wallet operations are disabled');
  };

  const logout = useCallback(async () => {
    if (magic) {
      try {
        await magic.user.logout();
      } catch (error) {
        console.error('Magic logout failed:', error);
      }
    }
    setUser({
      email: undefined,
      address: undefined,
      role: null,
      isConnected: false,
    });
  }, [magic]);

  const adminLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { adminLoginAction } = await import('@/app/actions/admin-auth');
      const res = await adminLoginAction(email, password);
      if (!res.success) throw new Error(res.error || 'Invalid admin credentials');
      const adminPk = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY;
      if (!adminPk) throw new Error('Admin private key not configured');
      const address = await blockchainService.initialize(adminPk);
      const next = {
        email,
        address,
        role: 'admin',
        isConnected: true,
      } as User;
      setUser(prev => {
        if (
          prev.email === next.email &&
          prev.address === next.address &&
          prev.role === next.role &&
          prev.isConnected === next.isConnected
        ) {
          return prev;
        }
        return next;
      });
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    authenticate,
    adminLogin,
    logout,
    exportPrivateKey,
    isLoading,
  }), [user, authenticate, adminLogin, logout, isLoading]);

  return (
    <AuthContext.Provider value={value}>
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
