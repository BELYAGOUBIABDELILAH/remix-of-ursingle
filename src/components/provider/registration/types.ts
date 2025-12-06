export interface ProviderFormData {
  // Step 1: Account Creation
  providerType: 'hospital' | 'clinic' | 'doctor' | 'pharmacy' | 'lab' | '';
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

  // Metadata
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
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

export const PROVIDER_TYPE_LABELS: Record<string, { fr: string; ar: string; icon: string }> = {
  hospital: { fr: 'Hôpital', ar: 'مستشفى', icon: '🏥' },
  clinic: { fr: 'Clinique', ar: 'عيادة', icon: '🏨' },
  doctor: { fr: 'Cabinet Médical', ar: 'عيادة طبية', icon: '👨‍⚕️' },
  pharmacy: { fr: 'Pharmacie', ar: 'صيدلية', icon: '💊' },
  lab: { fr: 'Laboratoire', ar: 'مختبر', icon: '🔬' },
};

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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'draft',
});
