// Firestore Provider Service
// Centralized service for reading/writing providers to Firestore

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
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

const PROVIDERS_COLLECTION = 'providers';

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
    // Optional type-specific fields
    bloodTypes: docData.bloodTypes,
    urgentNeed: docData.urgentNeed,
    stockStatus: docData.stockStatus,
    imagingTypes: docData.imagingTypes,
  };
}

// Convert CityHealthProvider to Firestore document
function providerToDoc(provider: CityHealthProvider): DocumentData {
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
    // Optional type-specific fields
    ...(provider.bloodTypes && { bloodTypes: provider.bloodTypes }),
    ...(provider.urgentNeed !== undefined && { urgentNeed: provider.urgentNeed }),
    ...(provider.stockStatus && { stockStatus: provider.stockStatus }),
    ...(provider.imagingTypes && { imagingTypes: provider.imagingTypes }),
    // Metadata
    updatedAt: Timestamp.now(),
  };
}

/**
 * Get all verified and public providers (for public search/map)
 */
export async function getVerifiedProviders(): Promise<CityHealthProvider[]> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(
    providersRef,
    where('verificationStatus', '==', 'verified'),
    where('isPublic', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
}

/**
 * Get all providers (admin only)
 */
export async function getAllProviders(): Promise<CityHealthProvider[]> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const snapshot = await getDocs(providersRef);
  return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
}

/**
 * Get a single provider by ID
 */
export async function getProviderById(id: string): Promise<CityHealthProvider | null> {
  const docRef = doc(db, PROVIDERS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return docToProvider(docSnap.data(), docSnap.id);
}

/**
 * Get providers by type
 */
export async function getProvidersByType(type: ProviderType): Promise<CityHealthProvider[]> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(
    providersRef,
    where('type', '==', type),
    where('verificationStatus', '==', 'verified'),
    where('isPublic', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
}

/**
 * Get emergency providers
 */
export async function getEmergencyProviders(): Promise<CityHealthProvider[]> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(
    providersRef,
    where('emergency', '==', true),
    where('verificationStatus', '==', 'verified'),
    where('isPublic', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
}

/**
 * Get blood donation centers
 */
export async function getBloodCenters(): Promise<CityHealthProvider[]> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(
    providersRef,
    where('type', 'in', ['blood_cabin', 'hospital']),
    where('verificationStatus', '==', 'verified'),
    where('isPublic', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
}

/**
 * Save a single provider
 */
export async function saveProvider(provider: CityHealthProvider): Promise<void> {
  const docRef = doc(db, PROVIDERS_COLLECTION, provider.id);
  await setDoc(docRef, providerToDoc(provider));
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
