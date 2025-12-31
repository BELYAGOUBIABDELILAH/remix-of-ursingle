import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProviderByUserId } from '@/hooks/useProviders';
import { CityHealthProvider } from '@/data/providers';

export type ProviderVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface ProviderContextType {
  // Provider data
  provider: CityHealthProvider | null;
  providerId: string | null;
  
  // Status flags
  isLoading: boolean;
  isProviderLoaded: boolean;
  hasProviderAccount: boolean;
  
  // Verification flags
  verificationStatus: ProviderVerificationStatus;
  isVerified: boolean;
  isPending: boolean;
  isRejected: boolean;
  isPublic: boolean;
  
  // Refresh function
  refetch: () => void;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export function ProviderProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Fetch provider data using TanStack Query
  const { 
    data: provider, 
    isLoading: providerLoading, 
    refetch 
  } = useProviderByUserId(user?.uid);
  
  // Derived state
  const isLoading = authLoading || providerLoading;
  const isProviderLoaded = !isLoading && provider !== undefined;
  const hasProviderAccount = !!provider;
  
  // Verification status
  const verificationStatus: ProviderVerificationStatus = 
    provider?.verificationStatus as ProviderVerificationStatus || 'pending';
  const isVerified = verificationStatus === 'verified';
  const isPending = verificationStatus === 'pending';
  const isRejected = verificationStatus === 'rejected';
  const isPublic = provider?.isPublic ?? false;
  
  return (
    <ProviderContext.Provider
      value={{
        provider: provider || null,
        providerId: provider?.id || null,
        isLoading,
        isProviderLoaded,
        hasProviderAccount,
        verificationStatus,
        isVerified,
        isPending,
        isRejected,
        isPublic,
        refetch,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider(): ProviderContextType {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
}

// Optional hook that returns null if not in provider context
export function useProviderOptional(): ProviderContextType | null {
  return useContext(ProviderContext) || null;
}
