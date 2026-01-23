// Centralized mock data and localStorage utilities for CityHealth
// NOTE: This is a frontend-only data layer for the MVP (no backend)

// Expanded Provider Types for Algeria Healthcare System
export type ProviderType = 
  | 'doctor' 
  | 'clinic' 
  | 'pharmacy' 
  | 'lab' 
  | 'hospital'
  | 'birth_hospital'
  | 'blood_cabin'
  | 'radiology_center'
  | 'medical_equipment';

export type Lang = 'ar' | 'fr' | 'en';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Opening hours for a day
export interface DaySchedule {
  open: string;
  close: string;
  closed?: boolean;
}

// Weekly schedule
export interface WeeklySchedule {
  lundi?: DaySchedule;
  mardi?: DaySchedule;
  mercredi?: DaySchedule;
  jeudi?: DaySchedule;
  vendredi?: DaySchedule;
  samedi?: DaySchedule;
  dimanche?: DaySchedule;
}

// Review for a provider
export interface ProviderReview {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CityHealthProvider {
  id: string;
  name: string;
  type: ProviderType;
  specialty?: string;
  rating: number;
  reviewsCount: number;
  distance: number; // km from city center (mocked)
  verified: boolean;
  emergency: boolean;
  accessible: boolean;
  isOpen: boolean;
  address: string;
  city: string;
  area: string;
  phone: string;
  image: string;
  lat: number;
  lng: number;
  languages: Lang[];
  description: string;
  
  // ========== VERIFICATION FIELDS ==========
  verificationStatus: VerificationStatus;
  isPublic: boolean;
  verificationRevokedAt?: Date | string;
  verificationRevokedReason?: string;
  
  // ========== TYPE-SPECIFIC FIELDS ==========
  bloodTypes?: string[];
  urgentNeed?: boolean;
  stockStatus?: 'critical' | 'low' | 'normal' | 'high';
  imagingTypes?: string[];
  // Medical equipment specific
  productCategories?: string[];
  rentalAvailable?: boolean;
  deliveryAvailable?: boolean;
  
  // ========== PROFILE FIELDS - CANONICAL NAMES ==========
  /** Gallery images - CANONICAL (not galleryImages) */
  gallery?: string[];
  schedule?: WeeklySchedule | null;
  reviews?: ProviderReview[];
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  } | null;
  departments?: string[];
  /** Consultation fee (can be number or null) */
  consultationFee?: number | null;
  /** Accepted insurances - CANONICAL (not insuranceAccepted) */
  insurances?: string[];
  /** @deprecated Use insurances instead */
  insuranceAccepted?: string[];
  website?: string | null;
  email?: string | null;
  /** Service categories - CANONICAL (not serviceCategories) */
  services?: string[];
  specialties?: string[];
  accessibilityFeatures?: string[];
  equipment?: string[];
  
  // ========== IDENTITY FIELDS (Sensitive) ==========
  legalRegistrationNumber?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  postalCode?: string;
  facilityNameFr?: string;
  facilityNameAr?: string;
  
  // ========== ADDITIONAL BUSINESS FIELDS ==========
  homeVisitAvailable?: boolean;
  is24_7?: boolean;
  
  // ========== ACCOUNT SETTINGS ==========
  settings?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    appointmentReminders?: boolean;
    marketingEmails?: boolean;
    showPhoneOnProfile?: boolean;
    showEmailOnProfile?: boolean;
    allowReviews?: boolean;
    language?: string;
  };
}

// Provider Type Labels (French/Arabic)
export const PROVIDER_TYPE_LABELS: Record<ProviderType, { fr: string; ar: string; icon: string }> = {
  hospital: { fr: 'Hôpital', ar: 'مستشفى', icon: '🏥' },
  birth_hospital: { fr: 'Maternité', ar: 'مستشفى الولادة', icon: '👶' },
  clinic: { fr: 'Clinique', ar: 'عيادة', icon: '🏨' },
  doctor: { fr: 'Cabinet Médical', ar: 'عيادة طبية', icon: '👨‍⚕️' },
  pharmacy: { fr: 'Pharmacie', ar: 'صيدلية', icon: '💊' },
  lab: { fr: 'Laboratoire d\'Analyses', ar: 'مختبر التحاليل', icon: '🔬' },
  blood_cabin: { fr: 'Centre de Don de Sang', ar: 'مركز التبرع بالدم', icon: '🩸' },
  radiology_center: { fr: 'Centre de Radiologie', ar: 'مركز الأشعة', icon: '📷' },
  medical_equipment: { fr: 'Équipement Médical', ar: 'معدات طبية', icon: '🦽' },
};

export const SPECIALTIES = [
  'Médecine générale',
  'Cardiologie',
  'Dermatologie',
  'Pédiatrie',
  'Gynécologie',
  'Ophtalmologie',
  'Dentisterie',
  'Radiologie',
  'Analyses médicales',
];

export const PROVIDER_TYPES: ProviderType[] = [
  'doctor',
  'clinic',
  'pharmacy',
  'lab',
  'hospital',
  'birth_hospital',
  'blood_cabin',
  'radiology_center',
  'medical_equipment',
];

export const AREAS = [
  'Centre Ville',
  'Hay El Badr',
  'Sidi Bel Abbès Est',
  'Sidi Bel Abbès Ouest',
  'Périphérie Nord',
  'Périphérie Sud',
];

const STORAGE_KEYS = {
  providers: 'ch_providers_v1',
  favorites: 'ch_favorites_v1',
}

function randomFrom<T>(arr: T[], i: number) {
  return arr[i % arr.length]
}

function pseudoRandom(i: number, min: number, max: number) {
  // deterministic pseudo-random based on index
  const x = Math.sin(i + 1) * 10000
  const frac = x - Math.floor(x)
  return Math.round((min + frac * (max - min)) * 10) / 10
}

function genPhone(i: number) {
  const a = 48
  const b = 50 + (i % 50)
  const c = 10 + (i % 40)
  const d = 10 + ((i * 3) % 40)
  return `+213 ${a} ${b.toString().padStart(2, '0')} ${c.toString().padStart(2, '0')} ${d.toString().padStart(2, '0')}`
}

function makeName(type: ProviderType, specialty: string | undefined, i: number) {
  switch (type) {
    case 'doctor':
      return `Dr. ${['Ahmed', 'Sara', 'Youssef', 'Imen', 'Nadia', 'Khaled', 'Rania'][i % 7]} ${['Benali', 'Bendaoud', 'Merabet', 'Saadi', 'Zerrouki'][i % 5]}${specialty ? ' - ' + specialty : ''}`
    case 'clinic':
      return `Clinique ${['El Amal', 'El Chifa', 'Ibn Sina', 'An Nasr', 'El Rahma'][i % 5]}`
    case 'pharmacy':
      return `Pharmacie ${['Centrale', 'El Fajr', 'El Baraka', 'El Wafa'][i % 4]}`
    case 'lab':
      return `Laboratoire ${['Atlas', 'Pasteur', 'BioLab', 'El Yakine'][i % 4]}`
    case 'hospital':
      return `Hôpital ${['Universitaire', 'Régional', 'Privé Al Hayat'][i % 3]}`
  }
}

function makeDescription(type: ProviderType) {
  const base = 'Service de santé de confiance à Sidi Bel Abbès, avec une équipe dédiée et des équipements modernes.'
  switch (type) {
    case 'doctor':
      return base + ' Consultation sur rendez-vous, suivi personnalisé et prévention.'
    case 'clinic':
      return base + ' Prise en charge pluridisciplinaire et urgences mineures.'
    case 'pharmacy':
      return base + ' Conseils pharmaceutiques, disponibilité 24/7 pour certaines officines.'
    case 'lab':
      return base + ' Analyses médicales rapides et précises, résultats numériques.'
    case 'hospital':
      return base + ' Plateaux techniques complets et services d’urgences 24/7.'
  }
}

export function generateMockProviders(count = 50): CityHealthProvider[] {
  const centerLat = 35.1975;
  const centerLng = -0.6300;
  const list: CityHealthProvider[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = randomFrom(PROVIDER_TYPES, i);
    const specialty = type === 'doctor' ? randomFrom(SPECIALTIES, i) : (type === 'lab' ? 'Analyses médicales' : (type === 'pharmacy' ? 'Pharmacie' : undefined));
    const rating = Math.min(5, Math.max(3.6, 3.5 + (i % 15) * 0.1 + (i % 3) * 0.05));
    const distance = pseudoRandom(i, 0.3, 18);
    const lat = centerLat + (pseudoRandom(i, -0.03, 0.03) as number);
    const lng = centerLng + (pseudoRandom(i + 3, -0.03, 0.03) as number);
    const verified = i % 3 !== 0;
    const emergency = type === 'hospital' || type === 'birth_hospital' || (i % 17 === 0);
    const accessible = i % 4 !== 0;
    const isOpen = i % 5 !== 0;
    const area = randomFrom(AREAS, i);
    const languages: Lang[] = (() => { const arr: Lang[] = ['fr']; if (i % 2 === 0) arr.push('ar'); if (i % 5 === 0) arr.push('en'); return arr; })();
    
    // Default to verified for mock data display
    const verificationStatus: VerificationStatus = verified ? 'verified' : 'pending';
    const isPublic = verificationStatus === 'verified';

    const item: CityHealthProvider = {
      id: (i + 1).toString(),
      name: makeName(type, specialty, i),
      type,
      specialty,
      rating: Math.round(rating * 10) / 10,
      reviewsCount: 20 + (i % 120),
      distance,
      verified,
      emergency,
      accessible,
      isOpen,
      address: `${1 + (i % 90)} Rue principale, ${area}`,
      city: 'Sidi Bel Abbès',
      area,
      phone: genPhone(i),
      image: '/placeholder.svg',
      lat,
      lng,
      languages,
      description: makeDescription(type),
      verificationStatus,
      isPublic,
      // Type-specific fields for blood_cabin
      ...(type === 'blood_cabin' ? {
        bloodTypes: ['A+', 'B+', 'O+', 'AB+'].slice(0, (i % 4) + 1),
        urgentNeed: i % 7 === 0,
        stockStatus: (['normal', 'low', 'critical', 'high'] as const)[i % 4],
      } : {}),
      // Type-specific fields for radiology_center
      ...(type === 'radiology_center' ? {
        imagingTypes: ['Radiographie standard', 'Scanner (CT)', 'Échographie'].slice(0, (i % 3) + 1),
      } : {}),
    };
    list.push(item);
  }
  return list;
}

export function seedProvidersIfNeeded(count = 50) {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.providers)
    if (!existing) {
      const gen = generateMockProviders(count)
      localStorage.setItem(STORAGE_KEYS.providers, JSON.stringify(gen))
    }
  } catch (e) {
    // ignore storage errors in restricted environments
  }
}

export function getProviders(): CityHealthProvider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.providers)
    if (!raw) return []
    return JSON.parse(raw) as CityHealthProvider[]
  } catch {
    return []
  }
}

export function getProviderById(id: string): CityHealthProvider | undefined {
  return getProviders().find((p) => p.id === id)
}

export function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]') as string[]
  } catch {
    return []
  }
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().includes(id)
}

export function toggleFavorite(id: string): boolean {
  try {
    const ids = getFavoriteIds()
    const idx = ids.indexOf(id)
    if (idx >= 0) ids.splice(idx, 1)
    else ids.push(id)
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids))
    return ids.includes(id)
  } catch {
    return false
  }
}

export function getFavoriteProviders(): CityHealthProvider[] {
  const ids = new Set(getFavoriteIds())
  return getProviders().filter((p) => ids.has(p.id))
}

// Legacy export for backward compatibility
export const providers = getProviders();
