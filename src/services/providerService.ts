// Provider Registration and Management Service
// Handles provider data with verification gate logic

import { CityHealthProvider, VerificationStatus } from '@/data/providers';

const STORAGE_KEYS = {
  providers: 'ch_providers_v1',
  pendingRegistrations: 'ch_pending_registrations',
};

export interface ProviderRegistration {
  id: string;
  providerType: string;
  facilityNameFr: string;
  facilityNameAr?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  status: 'pending' | 'approved' | 'rejected';
  verificationStatus: VerificationStatus;
  isPublic: boolean;
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  // All other form fields...
  [key: string]: unknown;
}

/**
 * Submit a new provider registration
 * Default: verificationStatus = 'pending', isPublic = false
 */
export function submitProviderRegistration(formData: Record<string, unknown>): ProviderRegistration {
  const registration: ProviderRegistration = {
    ...formData,
    id: `reg_${Date.now()}`,
    status: 'pending',
    verificationStatus: 'pending',
    isPublic: false,
    submittedAt: new Date().toISOString(),
  } as ProviderRegistration;

  const registrations = getPendingRegistrations();
  registrations.push(registration);
  localStorage.setItem(STORAGE_KEYS.pendingRegistrations, JSON.stringify(registrations));

  return registration;
}

/**
 * Get all pending registrations (for admin)
 */
export function getPendingRegistrations(): ProviderRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.pendingRegistrations);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Approve a provider registration
 * Sets verificationStatus = 'verified' and isPublic = true
 */
export function approveRegistration(id: string): ProviderRegistration | null {
  const registrations = getPendingRegistrations();
  const index = registrations.findIndex(r => r.id === id);
  
  if (index === -1) return null;

  registrations[index] = {
    ...registrations[index],
    status: 'approved',
    verificationStatus: 'verified',
    isPublic: true,
    approvedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.pendingRegistrations, JSON.stringify(registrations));

  // Also add to main providers list
  addToProvidersList(registrations[index]);

  return registrations[index];
}

/**
 * Reject a provider registration
 */
export function rejectRegistration(id: string, reason?: string): ProviderRegistration | null {
  const registrations = getPendingRegistrations();
  const index = registrations.findIndex(r => r.id === id);
  
  if (index === -1) return null;

  registrations[index] = {
    ...registrations[index],
    status: 'rejected',
    verificationStatus: 'rejected',
    isPublic: false,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
  };

  localStorage.setItem(STORAGE_KEYS.pendingRegistrations, JSON.stringify(registrations));
  return registrations[index];
}

/**
 * Add approved registration to main providers list
 */
function addToProvidersList(registration: ProviderRegistration): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.providers);
    const providers: CityHealthProvider[] = raw ? JSON.parse(raw) : [];

    const newProvider: CityHealthProvider = {
      id: registration.id,
      name: registration.facilityNameFr,
      type: registration.providerType as CityHealthProvider['type'],
      rating: 0,
      reviewsCount: 0,
      distance: 0,
      verified: true,
      emergency: false,
      accessible: true,
      isOpen: true,
      address: registration.address,
      city: registration.city,
      area: registration.area,
      phone: registration.phone,
      image: '/placeholder.svg',
      lat: 35.1975,
      lng: -0.6300,
      languages: ['fr', 'ar'],
      description: (registration.description as string) || '',
      verificationStatus: 'verified',
      isPublic: true,
    };

    providers.push(newProvider);
    localStorage.setItem(STORAGE_KEYS.providers, JSON.stringify(providers));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get only verified and public providers
 * This is the GLOBAL VISIBILITY FILTER
 */
export function getVerifiedProviders(): CityHealthProvider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.providers);
    if (!raw) return [];
    const providers: CityHealthProvider[] = JSON.parse(raw);
    
    // MANDATORY FILTER: Only return verified and public providers
    return providers.filter(p => 
      p.verificationStatus === 'verified' && p.isPublic === true
    );
  } catch {
    return [];
  }
}

/**
 * Get all providers (admin only, bypasses visibility filter)
 */
export function getAllProvidersAdmin(): CityHealthProvider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.providers);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get registration statistics for admin dashboard
 */
export function getRegistrationStats() {
  const registrations = getPendingRegistrations();
  
  return {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };
}
