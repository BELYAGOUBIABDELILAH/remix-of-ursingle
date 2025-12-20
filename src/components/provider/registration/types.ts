// Expanded Provider Types for Algeria Healthcare System
export type ProviderTypeKey = 
  | 'hospital' 
  | 'birth_hospital' 
  | 'clinic' 
  | 'doctor' 
  | 'pharmacy' 
  | 'lab' 
  | 'blood_cabin' 
  | 'radiology_center' 
  | 'medical_equipment'
  | '';

export interface ProviderFormData {
  // Step 1: Account Creation
  providerType: ProviderTypeKey;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;

  // Step 2: Basic Information
  facilityNameFr: string;
  facilityNameAr: string;
  legalRegistrationNumber: string;
  contactPersonName: string;
  contactPersonRole: string;
  phone: string;
  phoneVerified: boolean;
  emailVerified: boolean;

  // Step 3: Location & Availability
  address: string;
  city: string;
  area: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  schedule: WeeklySchedule;
  is24_7: boolean;
  homeVisitAvailable: boolean;
  additionalLocations: AdditionalLocation[];

  // Step 4: Services & Specializations
  serviceCategories: string[];
  specialties: string[];
  departments: string[];
  equipment: string[];
  accessibilityFeatures: string[];
  languages: string[];

  // Step 5: Profile Enhancement
  logo: File | null;
  logoPreview: string;
  galleryPhotos: File[];
  galleryPreviews: string[];
  description: string;
  insuranceAccepted: string[];
  consultationFee: string;
  socialLinks: SocialLinks;
  verificationDocuments: { name: string; type: 'license' | 'certificate' | 'photo' }[];

  // Type-Specific Fields (Blood Cabin)
  bloodTypes?: string[];
  urgentNeed?: boolean;
  stockStatus?: 'critical' | 'low' | 'normal' | 'high';

  // Type-Specific Fields (Radiology Center)
  imagingTypes?: string[];

  // Type-Specific Fields (Medical Equipment)
  productCategories?: string[];
  rentalAvailable?: boolean;
  deliveryAvailable?: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isPublic: boolean;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface AdditionalLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

// Expanded Provider Type Labels
export const PROVIDER_TYPE_LABELS: Record<string, { fr: string; ar: string; icon: string; category: string }> = {
  hospital: { fr: 'Hôpital', ar: 'مستشفى', icon: '🏥', category: 'medical' },
  birth_hospital: { fr: 'Maternité', ar: 'مستشفى الولادة', icon: '👶', category: 'medical' },
  clinic: { fr: 'Clinique', ar: 'عيادة', icon: '🏨', category: 'medical' },
  doctor: { fr: 'Cabinet Médical', ar: 'عيادة طبية', icon: '👨‍⚕️', category: 'medical' },
  pharmacy: { fr: 'Pharmacie', ar: 'صيدلية', icon: '💊', category: 'pharmacy' },
  lab: { fr: 'Laboratoire d\'Analyses', ar: 'مختبر التحاليل', icon: '🔬', category: 'diagnostic' },
  blood_cabin: { fr: 'Centre de Don de Sang', ar: 'مركز التبرع بالدم', icon: '🩸', category: 'diagnostic' },
  radiology_center: { fr: 'Centre de Radiologie', ar: 'مركز الأشعة', icon: '📷', category: 'diagnostic' },
  medical_equipment: { fr: 'Équipement Médical', ar: 'معدات طبية', icon: '🦽', category: 'equipment' },
};

// Blood Types for Blood Cabin
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Stock Status Labels
export const STOCK_STATUS_LABELS: Record<string, { fr: string; ar: string; color: string }> = {
  critical: { fr: 'Critique', ar: 'حرج', color: 'destructive' },
  low: { fr: 'Faible', ar: 'منخفض', color: 'warning' },
  normal: { fr: 'Normal', ar: 'عادي', color: 'default' },
  high: { fr: 'Élevé', ar: 'مرتفع', color: 'success' },
};

// Imaging Types for Radiology
export const IMAGING_TYPES = [
  'Radiographie standard',
  'Scanner (CT)',
  'IRM',
  'Échographie',
  'Mammographie',
  'Panoramique dentaire',
  'Densitométrie osseuse',
  'Angiographie',
];

// Medical Equipment Categories
export const EQUIPMENT_CATEGORIES = [
  'Fauteuils roulants',
  'Lits médicalisés',
  'Oxygène médical',
  'Matériel de perfusion',
  'Prothèses',
  'Orthèses',
  'Matériel de rééducation',
  'Moniteurs de santé',
  'Aide à la mobilité',
];

export const SERVICE_CATEGORIES = [
  'Médecine générale',
  'Médecine spécialisée',
  'Chirurgie',
  'Urgences',
  'Radiologie',
  'Analyses médicales',
  'Kinésithérapie',
  'Soins dentaires',
  'Ophtalmologie',
  'Gynécologie',
  'Pédiatrie',
  'Cardiologie',
  'Dermatologie',
  'Neurologie',
  'Psychiatrie',
  'Pharmacie',
];

export const MEDICAL_SPECIALTIES = [
  'Médecine générale',
  'Cardiologie',
  'Dermatologie',
  'Gastro-entérologie',
  'Gynécologie-Obstétrique',
  'Neurologie',
  'Ophtalmologie',
  'ORL',
  'Orthopédie',
  'Pédiatrie',
  'Pneumologie',
  'Psychiatrie',
  'Radiologie',
  'Rhumatologie',
  'Urologie',
  'Anesthésie-Réanimation',
  'Chirurgie générale',
  'Médecine interne',
];

export const EQUIPMENT_OPTIONS = [
  'Scanner / CT',
  'IRM',
  'Radiographie',
  'Échographie',
  'ECG',
  'Laboratoire sur place',
  'Bloc opératoire',
  'Salle d\'accouchement',
  'Réanimation',
  'Dialyse',
  'Stérilisation',
  'Oxygène médical',
];

export const ACCESSIBILITY_OPTIONS = [
  'Accès fauteuil roulant',
  'Ascenseur',
  'Parking handicapé',
  'Toilettes adaptées',
  'Signalétique braille',
  'Personnel formé LSF',
  'Audio-guidage',
];

export const INSURANCE_OPTIONS = [
  'CNAS',
  'CASNOS',
  'Assurance privée',
  'Mutuelles',
  'Tiers payant',
  'Sans assurance (paiement direct)',
];

export const LANGUAGES_OPTIONS = [
  { code: 'ar', label: 'العربية (Arabe)' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'amazigh', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ (Amazigh)' },
];

export const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  friday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  saturday: { isOpen: true, openTime: '08:00', closeTime: '12:00' },
  sunday: { isOpen: false, openTime: '08:00', closeTime: '12:00' },
};

export const getInitialFormData = (): ProviderFormData => ({
  providerType: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  facilityNameFr: '',
  facilityNameAr: '',
  legalRegistrationNumber: '',
  contactPersonName: '',
  contactPersonRole: '',
  phone: '',
  phoneVerified: false,
  emailVerified: false,
  address: '',
  city: 'Sidi Bel Abbès',
  area: '',
  postalCode: '',
  lat: null,
  lng: null,
  schedule: DEFAULT_SCHEDULE,
  is24_7: false,
  homeVisitAvailable: false,
  additionalLocations: [],
  serviceCategories: [],
  specialties: [],
  departments: [],
  equipment: [],
  accessibilityFeatures: [],
  languages: ['fr', 'ar'],
  logo: null,
  logoPreview: '',
  galleryPhotos: [],
  galleryPreviews: [],
  description: '',
  insuranceAccepted: [],
  consultationFee: '',
  socialLinks: {},
  verificationDocuments: [],
  // Type-specific fields
  bloodTypes: [],
  urgentNeed: false,
  stockStatus: 'normal',
  imagingTypes: [],
  productCategories: [],
  rentalAvailable: false,
  deliveryAvailable: false,
  // Metadata
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'draft',
  verificationStatus: 'pending',
  isPublic: false,
});

// Helper to get type-specific fields config
export const getTypeSpecificFields = (providerType: ProviderTypeKey) => {
  switch (providerType) {
    case 'blood_cabin':
      return {
        showBloodTypes: true,
        showStockStatus: true,
        showUrgentNeed: true,
      };
    case 'radiology_center':
      return {
        showImagingTypes: true,
      };
    case 'medical_equipment':
      return {
        showProductCategories: true,
        showRentalOption: true,
        showDeliveryOption: true,
      };
    default:
      return {};
  }
};
