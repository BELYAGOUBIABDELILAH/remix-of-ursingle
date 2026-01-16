import { createContext, useContext, ReactNode } from 'react';
import { useAuth, DEV_BYPASS_AUTH } from '@/contexts/AuthContext';
import { useProviderByUserId, useUpdateProvider } from '@/hooks/useProviders';
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
  
  // Update functions
  updateProviderData: (updates: Partial<CityHealthProvider>) => Promise<void>;
  isSaving: boolean;
  
  // Refresh function
  refetch: () => void;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

// ========== DEV MODE: MOCK PROVIDER ==========
const MOCK_PROVIDER: CityHealthProvider = {
  id: 'dev-provider-mock',
  name: 'Cabinet Médical Dev',
  type: 'doctor',
  specialty: 'Médecine Générale',
  rating: 4.8,
  reviewsCount: 42,
  distance: 0,
  verified: true,
  emergency: false,
  accessible: true,
  isOpen: true,
  address: '123 Rue de Test, Alger',
  city: 'Alger',
  area: 'Centre',
  phone: '+213 555 123 456',
  image: '/placeholder.svg',
  lat: 36.7538,
  lng: 3.0588,
  languages: ['fr', 'ar'],
  description: 'Cabinet de développement pour tests',
  verificationStatus: 'verified',
  isPublic: true,
  gallery: [],
  
};
// ============================================

export function ProviderProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  
  // Fetch provider data using TanStack Query
  const { 
    data: provider, 
    isLoading: providerLoading, 
    refetch 
  } = useProviderByUserId(user?.uid);
  
  // Mutation for updating provider
  const { mutateAsync: updateMutation, isPending: isSaving } = useUpdateProvider();

  // DEV MODE: Return mock provider context
  if (DEV_BYPASS_AUTH) {
    console.warn('🔓 DEV MODE: Provider context bypassed - Mock provider active');
    return (
      <ProviderContext.Provider
        value={{
          provider: MOCK_PROVIDER,
          providerId: 'dev-provider-mock',
          isLoading: false,
          isProviderLoaded: true,
          hasProviderAccount: true,
          verificationStatus: 'verified',
          isVerified: true,
          isPending: false,
          isRejected: false,
          isPublic: true,
          updateProviderData: async (updates) => {
            console.warn('🔓 DEV MODE: Provider update bypassed', updates);
          },
          isSaving: false,
          refetch: () => console.warn('🔓 DEV MODE: Provider refetch bypassed'),
        }}
      >
        {children}
      </ProviderContext.Provider>
    );
  }
  
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
  
  // Update function that syncs to Firestore
  const updateProviderData = async (updates: Partial<CityHealthProvider>): Promise<void> => {
    if (!provider?.id) {
      throw new Error('No provider ID available');
    }
    await updateMutation({ providerId: provider.id, updates });
  };
  
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
        updateProviderData,
        isSaving,
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
