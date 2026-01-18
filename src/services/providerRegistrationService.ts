// Provider Registration Service
// Handles account creation, provider document, and role assignment

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ProviderFormData, PROVIDER_TYPE_LABELS } from '@/components/provider/registration/types';
import { logError } from '@/utils/errorHandling';

export interface RegistrationResult {
  success: boolean;
  providerId?: string;
  userId?: string;
  error?: string;
}

/**
 * Create a complete provider account from registration form data
 * 1. Create Firebase Auth account (or use existing)
 * 2. Create Firestore profile
 * 3. Assign 'provider' role
 * 4. Create provider document
 * 
 * IMPORTANT: Prevents duplicate provider accounts using providerId = provider_{userId}
 */
export async function createProviderFromRegistration(
  formData: ProviderFormData
): Promise<RegistrationResult> {
  try {
    let userId: string;
    
    // Check if user is already authenticated (e.g., Google OAuth in Step 1)
    if (auth.currentUser) {
      userId = auth.currentUser.uid;
      
      // Check if provider already exists for this user
      const existingProvider = await getExistingProvider(userId);
      if (existingProvider) {
        return {
          success: false,
          error: 'Un compte professionnel existe déjà pour cet utilisateur. Veuillez vous connecter à votre espace professionnel.',
          providerId: existingProvider
        };
      }
    } else {
      // Create new Firebase Auth account
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        userId = userCredential.user.uid;
        
        // Update Firebase Auth display name
        await firebaseUpdateProfile(userCredential.user, {
          displayName: formData.facilityNameFr || formData.contactPersonName
        });
      } catch (authError: any) {
        // Handle email-already-in-use specifically
        if (authError.code === 'auth/email-already-in-use') {
          return {
            success: false,
            error: 'Cette adresse email est déjà utilisée. Si vous avez déjà un compte, veuillez vous connecter.'
          };
        }
        throw authError;
      }
    }

    // Create Firestore profile
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        id: userId,
        email: formData.email,
        full_name: formData.contactPersonName || formData.facilityNameFr,
        avatar_url: formData.logoPreview || null,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
    }

    // Assign 'provider' role (won't duplicate if exists)
    await assignProviderRole(userId);

    // Generate provider ID
    const providerId = `provider_${userId}`;

    // Create provider document
    await createProviderDocument(providerId, userId, formData);

    return {
      success: true,
      providerId,
      userId
    };
  } catch (error: any) {
    logError(error, 'createProviderFromRegistration');
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'Cette adresse email est déjà utilisée. Si vous avez déjà un compte, veuillez vous connecter.'
      };
    }
    
    if (error.code === 'auth/weak-password') {
      return {
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères.'
      };
    }
    
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'L\'adresse email n\'est pas valide.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la création du compte.'
    };
  }
}

/**
 * Assign provider role to user
 */
export async function assignProviderRole(userId: string): Promise<void> {
  const roleDocId = `${userId}_provider`;
  const roleRef = doc(db, 'user_roles', roleDocId);
  
  // Check if role already exists
  const roleSnap = await getDoc(roleRef);
  if (!roleSnap.exists()) {
    await setDoc(roleRef, {
      user_id: userId,
      role: 'provider',
      created_at: Timestamp.now()
    });
  }
}

/**
 * Create provider document in Firestore
 */
async function createProviderDocument(
  providerId: string, 
  userId: string, 
  formData: ProviderFormData
): Promise<void> {
  const providerRef = doc(db, 'providers', providerId);
  
  // Map provider type to display type
  const typeMapping: Record<string, string> = {
    'hospital': 'hospital',
    'birth_hospital': 'hospital',
    'clinic': 'clinic',
    'doctor': 'doctor',
    'pharmacy': 'pharmacy',
    'lab': 'laboratory',
    'blood_cabin': 'blood_cabin',
    'radiology_center': 'radiology',
    'medical_equipment': 'equipment'
  };

  const providerData = {
    // Link to Firebase Auth user
    userId,
    
    // Basic info
    name: formData.facilityNameFr,
    nameFr: formData.facilityNameFr,
    nameAr: formData.facilityNameAr,
    type: typeMapping[formData.providerType] || formData.providerType,
    providerType: formData.providerType,
    
    // Contact
    email: formData.email,
    phone: formData.phone,
    contactPersonName: formData.contactPersonName,
    contactPersonRole: formData.contactPersonRole,
    
    // Location
    address: formData.address,
    city: formData.city || 'Sidi Bel Abbès',
    area: formData.area,
    postalCode: formData.postalCode,
    lat: formData.lat || 35.1975,
    lng: formData.lng || -0.6300,
    
    // Schedule
    schedule: formData.schedule,
    is24_7: formData.is24_7,
    homeVisitAvailable: formData.homeVisitAvailable,
    
    // Services
    serviceCategories: formData.serviceCategories,
    specialties: formData.specialties,
    specialty: formData.specialties[0] || null,
    departments: formData.departments,
    equipment: formData.equipment,
    accessibilityFeatures: formData.accessibilityFeatures,
    languages: formData.languages,
    
    // Profile
    description: formData.description,
    image: formData.logoPreview || '/placeholder.svg',
    galleryImages: formData.galleryPreviews,
    insuranceAccepted: formData.insuranceAccepted,
    consultationFee: formData.consultationFee,
    socialLinks: formData.socialLinks,
    
    // Type-specific fields
    ...(formData.bloodTypes && { bloodTypes: formData.bloodTypes }),
    ...(formData.urgentNeed !== undefined && { urgentNeed: formData.urgentNeed }),
    ...(formData.stockStatus && { stockStatus: formData.stockStatus }),
    ...(formData.imagingTypes && { imagingTypes: formData.imagingTypes }),
    ...(formData.productCategories && { productCategories: formData.productCategories }),
    ...(formData.rentalAvailable !== undefined && { rentalAvailable: formData.rentalAvailable }),
    ...(formData.deliveryAvailable !== undefined && { deliveryAvailable: formData.deliveryAvailable }),
    
    // Default values
    rating: 0,
    reviewsCount: 0,
    distance: 0,
    isOpen: false,
    accessible: formData.accessibilityFeatures.length > 0,
    emergency: formData.is24_7,
    
    // Verification status - PENDING until admin approves
    verificationStatus: 'pending',
    isPublic: false,
    verified: false,
    
    // Timestamps
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    submittedAt: Timestamp.now(),
  };

  await setDoc(providerRef, providerData);
}

/**
 * Check if a provider already exists for a user
 */
export async function getExistingProvider(userId: string): Promise<string | null> {
  try {
    const providersRef = collection(db, 'providers');
    const q = query(providersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    return null;
  } catch (error) {
    logError(error, 'getExistingProvider');
    return null;
  }
}

