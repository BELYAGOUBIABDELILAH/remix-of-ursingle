// Firestore Provider Service
// Centralized service for reading/writing providers to Firestore
// With fallback to reference data when Firestore is unavailable

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  updateDoc, 
  query, 
  where,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CityHealthProvider, ProviderType, VerificationStatus, Lang } from '@/data/providers';
import { REFERENCE_PROVIDERS } from '@/data/referenceProviders';
import { logError, handleError } from '@/utils/errorHandling';

const PROVIDERS_COLLECTION = 'providers';

// Flag to track if Firestore is available
let firestoreAvailable = true;
let fallbackUsed = false;

// Get fallback providers (reference data)
function getFallbackProviders(): CityHealthProvider[] {
  fallbackUsed = true;
  return REFERENCE_PROVIDERS.filter(p => p.verificationStatus === 'verified' && p.isPublic);
}

// Convert Firestore document to CityHealthProvider
function docToProvider(docData: DocumentData, id: string): CityHealthProvider {
  return {
    id,
    name: docData.name || '',
    type: docData.type as ProviderType,
    specialty: docData.specialty,
    rating: docData.rating || 0,
    reviewsCount: docData.reviewsCount || 0,
    distance: docData.distance || 0,
    verified: docData.verified || false,
    emergency: docData.emergency || false,
    accessible: docData.accessible || true,
    isOpen: docData.isOpen || false,
    address: docData.address || '',
    city: docData.city || 'Sidi Bel Abbès',
    area: docData.area || '',
    phone: docData.phone || '',
    image: docData.image || '/placeholder.svg',
    lat: docData.lat || 35.1975,
    lng: docData.lng || -0.6300,
    languages: (docData.languages || ['fr']) as Lang[],
    description: docData.description || '',
    verificationStatus: (docData.verificationStatus || 'pending') as VerificationStatus,
    isPublic: docData.isPublic || false,
    // Type-specific fields
    bloodTypes: docData.bloodTypes,
    urgentNeed: docData.urgentNeed,
    stockStatus: docData.stockStatus,
    imagingTypes: docData.imagingTypes,
    // Enhanced profile fields
    gallery: docData.gallery || [],
    schedule: docData.schedule || null,
    reviews: docData.reviews || [],
    // Additional profile fields
    socialLinks: docData.socialLinks || null,
    departments: docData.departments || [],
    consultationFee: docData.consultationFee || null,
    insuranceAccepted: docData.insuranceAccepted || [],
    website: docData.website || null,
    email: docData.email || null,
    // Account settings
    settings: docData.settings || undefined,
  };
}

// Convert CityHealthProvider to Firestore document
function providerToDoc(provider: CityHealthProvider & { userId?: string }): DocumentData {
  return {
    name: provider.name,
    type: provider.type,
    specialty: provider.specialty || null,
    rating: provider.rating,
    reviewsCount: provider.reviewsCount,
    distance: provider.distance,
    verified: provider.verified,
    emergency: provider.emergency,
    accessible: provider.accessible,
    isOpen: provider.isOpen,
    address: provider.address,
    city: provider.city,
    area: provider.area,
    phone: provider.phone,
    image: provider.image,
    lat: provider.lat,
    lng: provider.lng,
    languages: provider.languages,
    description: provider.description,
    verificationStatus: provider.verificationStatus,
    isPublic: provider.isPublic,
    // User ID linking to Firebase Auth
    ...(provider.userId && { userId: provider.userId }),
    // Type-specific fields
    ...(provider.bloodTypes && { bloodTypes: provider.bloodTypes }),
    ...(provider.urgentNeed !== undefined && { urgentNeed: provider.urgentNeed }),
    ...(provider.stockStatus && { stockStatus: provider.stockStatus }),
    ...(provider.imagingTypes && { imagingTypes: provider.imagingTypes }),
    // Enhanced profile fields
    ...(provider.gallery && { gallery: provider.gallery }),
    ...(provider.schedule && { schedule: provider.schedule }),
    ...(provider.reviews && { reviews: provider.reviews }),
    // Additional profile fields
    ...(provider.socialLinks && { socialLinks: provider.socialLinks }),
    ...(provider.departments && { departments: provider.departments }),
    ...(provider.consultationFee && { consultationFee: provider.consultationFee }),
    ...(provider.insuranceAccepted && { insuranceAccepted: provider.insuranceAccepted }),
    ...(provider.website && { website: provider.website }),
    ...(provider.email && { email: provider.email }),
    // Account settings
    ...(provider.settings && { settings: provider.settings }),
    // Metadata
    updatedAt: Timestamp.now(),
  };
}

/**
 * Get all verified and public providers (for public search/map)
 * Falls back to reference data if Firestore is unavailable
 */
export async function getVerifiedProviders(): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return getFallbackProviders();
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const q = query(
      providersRef,
      where('verificationStatus', '==', 'verified'),
      where('isPublic', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    // If no data in Firestore, use fallback
    if (snapshot.empty) {
      return getFallbackProviders();
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    // Check if it's a permission error - silently use fallback
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
      return getFallbackProviders();
    }
    
    logError(error, 'getVerifiedProviders');
    // Return fallback on any error
    return getFallbackProviders();
  }
}

/**
 * Get all providers (admin only)
 */
export async function getAllProviders(): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS;
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const snapshot = await getDocs(providersRef);
    
    if (snapshot.empty) {
      return REFERENCE_PROVIDERS;
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    logError(error, 'getAllProviders');
    return REFERENCE_PROVIDERS;
  }
}

/**
 * Get a single provider by ID
 */
export async function getProviderById(id: string): Promise<CityHealthProvider | null> {
  try {
    // Check fallback first
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS.find(p => p.id === id) || null;
    }
    
    const docRef = doc(db, PROVIDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Try fallback
      return REFERENCE_PROVIDERS.find(p => p.id === id) || null;
    }
    
    return docToProvider(docSnap.data(), docSnap.id);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    logError(error, `getProviderById: ${id}`);
    return REFERENCE_PROVIDERS.find(p => p.id === id) || null;
  }
}

/**
 * Get providers by type
 */
export async function getProvidersByType(type: ProviderType): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS.filter(p => p.type === type && p.verificationStatus === 'verified' && p.isPublic);
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const q = query(
      providersRef,
      where('type', '==', type),
      where('verificationStatus', '==', 'verified'),
      where('isPublic', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return REFERENCE_PROVIDERS.filter(p => p.type === type && p.verificationStatus === 'verified' && p.isPublic);
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    return REFERENCE_PROVIDERS.filter(p => p.type === type && p.verificationStatus === 'verified' && p.isPublic);
  }
}

/**
 * Get emergency providers
 */
export async function getEmergencyProviders(): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS.filter(p => p.emergency && p.verificationStatus === 'verified' && p.isPublic);
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const q = query(
      providersRef,
      where('emergency', '==', true),
      where('verificationStatus', '==', 'verified'),
      where('isPublic', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return REFERENCE_PROVIDERS.filter(p => p.emergency && p.verificationStatus === 'verified' && p.isPublic);
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    return REFERENCE_PROVIDERS.filter(p => p.emergency && p.verificationStatus === 'verified' && p.isPublic);
  }
}

/**
 * Get blood donation centers
 */
export async function getBloodCenters(): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS.filter(p => 
        (p.type === 'blood_cabin' || p.type === 'hospital') && 
        p.verificationStatus === 'verified' && 
        p.isPublic
      );
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const q = query(
      providersRef,
      where('type', 'in', ['blood_cabin', 'hospital']),
      where('verificationStatus', '==', 'verified'),
      where('isPublic', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return REFERENCE_PROVIDERS.filter(p => 
        (p.type === 'blood_cabin' || p.type === 'hospital') && 
        p.verificationStatus === 'verified' && 
        p.isPublic
      );
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    return REFERENCE_PROVIDERS.filter(p => 
      (p.type === 'blood_cabin' || p.type === 'hospital') && 
      p.verificationStatus === 'verified' && 
      p.isPublic
    );
  }
}

/**
 * Save a single provider
 */
export async function saveProvider(provider: CityHealthProvider): Promise<void> {
  const docRef = doc(db, PROVIDERS_COLLECTION, provider.id);
  await setDoc(docRef, providerToDoc(provider));
}

/**
 * Update an existing provider with partial data
 * Used by providers to update their own profile
 */
export async function updateProvider(
  providerId: string,
  updates: Partial<CityHealthProvider>
): Promise<void> {
  const docRef = doc(db, PROVIDERS_COLLECTION, providerId);
  
  // Filter out undefined values and add metadata
  const cleanUpdates: Record<string, any> = {};
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanUpdates[key] = value;
    }
  });
  
  await updateDoc(docRef, {
    ...cleanUpdates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update provider with verification status check
 * Automatically revokes verification if sensitive fields are modified
 */
export async function updateProviderWithVerificationCheck(
  providerId: string,
  updates: Partial<CityHealthProvider>,
  currentVerificationStatus: 'pending' | 'verified' | 'rejected'
): Promise<{ success: boolean; verificationRevoked: boolean; modifiedSensitiveFields: string[] }> {
  // Import dynamically to avoid circular dependencies
  const { isSensitiveField } = await import('@/constants/sensitiveFields');
  
  // Check if any sensitive fields are being modified
  const sensitiveFieldsModified = Object.keys(updates).filter(key => 
    isSensitiveField(key)
  );
  
  const shouldRevokeVerification = 
    currentVerificationStatus === 'verified' && 
    sensitiveFieldsModified.length > 0;
  
  const docRef = doc(db, PROVIDERS_COLLECTION, providerId);
  
  // Filter out undefined values
  const cleanUpdates: Record<string, any> = {};
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanUpdates[key] = value;
    }
  });
  
  // Add verification revocation if needed
  if (shouldRevokeVerification) {
    cleanUpdates.verificationStatus = 'pending';
    cleanUpdates.isPublic = false;
    cleanUpdates.verified = false;
    cleanUpdates.verificationRevokedAt = Timestamp.now();
    cleanUpdates.verificationRevokedReason = `Modified: ${sensitiveFieldsModified.join(', ')}`;
  }
  
  await updateDoc(docRef, {
    ...cleanUpdates,
    updatedAt: Timestamp.now(),
  });
  
  // Create admin notification if verification was revoked
  if (shouldRevokeVerification) {
    try {
      const { notifyVerificationRevoked } = await import('@/services/adminNotificationService');
      const providerName = updates.name || cleanUpdates.name || 'Prestataire';
      await notifyVerificationRevoked(providerId, providerName, sensitiveFieldsModified);
    } catch (error) {
      // Don't fail the main operation if notification fails
      console.error('Failed to create admin notification:', error);
    }
  }
  
  return { 
    success: true, 
    verificationRevoked: shouldRevokeVerification,
    modifiedSensitiveFields: sensitiveFieldsModified,
  };
}

/**
 * Batch save multiple providers (for migration)
 */
export async function batchSaveProviders(providers: CityHealthProvider[]): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;
  
  // Firestore batch limit is 500 operations
  const chunks: CityHealthProvider[][] = [];
  for (let i = 0; i < providers.length; i += 500) {
    chunks.push(providers.slice(i, i + 500));
  }
  
  for (const chunk of chunks) {
    const chunkBatch = writeBatch(db);
    for (const provider of chunk) {
      const docRef = doc(db, PROVIDERS_COLLECTION, provider.id);
      chunkBatch.set(docRef, {
        ...providerToDoc(provider),
        createdAt: Timestamp.now(),
      });
      count++;
    }
    await chunkBatch.commit();
  }
  
  return count;
}

/**
 * Check if providers collection has data
 */
export async function hasProviders(): Promise<boolean> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(providersRef, limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Search providers by name or specialty
 */
export async function searchProviders(searchQuery: string): Promise<CityHealthProvider[]> {
  // Firestore doesn't support full-text search, so we fetch verified providers
  // and filter client-side. For production, use Algolia or similar.
  const providers = await getVerifiedProviders();
  const query = searchQuery.toLowerCase();
  
  return providers.filter(p => 
    p.name.toLowerCase().includes(query) ||
    (p.specialty?.toLowerCase().includes(query)) ||
    p.address.toLowerCase().includes(query) ||
    p.area.toLowerCase().includes(query)
  );
}

/**
 * Update provider verification status (admin only)
 */
export async function updateProviderVerification(
  providerId: string,
  verificationStatus: 'pending' | 'verified' | 'rejected',
  isPublic: boolean
): Promise<void> {
  const docRef = doc(db, PROVIDERS_COLLECTION, providerId);
  await updateDoc(docRef, {
    verificationStatus,
    isPublic,
    verified: verificationStatus === 'verified',
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get all pending provider registrations (admin only)
 */
export async function getPendingProviders(): Promise<CityHealthProvider[]> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(
    providersRef,
    where('verificationStatus', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
}

/**
 * Get provider verification status by user ID
 */
export async function getProviderByUserId(userId: string): Promise<CityHealthProvider | null> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(
    providersRef,
    where('userId', '==', userId),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  return docToProvider(snapshot.docs[0].data(), snapshot.docs[0].id);
}
