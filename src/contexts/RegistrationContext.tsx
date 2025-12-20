import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { ProviderFormData, getInitialFormData } from '@/components/provider/registration/types';

interface ProfileScore {
  total: number;
  identity: number; // 20% - providerType, email, password
  institution: number; // 20% - facilityName, legalRegistration, contact
  visibility: number; // 30% - location + operating hours
  enhancement: number; // 30% - gallery, description, social
  isSearchable: boolean; // True when visibility >= 70%
}

interface RegistrationContextType {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completedSteps: number[];
  setCompletedSteps: React.Dispatch<React.SetStateAction<number[]>>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  profileScore: ProfileScore;
  lastSaved: Date | null;
  isSaving: boolean;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

const STORAGE_KEY = 'ch_provider_registration_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Calculate profile completion score
const calculateProfileScore = (formData: ProviderFormData): ProfileScore => {
  let identity = 0;
  let institution = 0;
  let visibility = 0;
  let enhancement = 0;

  // Identity (20%) - Step 1
  if (formData.providerType) identity += 10;
  if (formData.email && formData.email.includes('@')) identity += 5;
  if (formData.password && formData.password.length >= 8) identity += 5;

  // Institution (20%) - Step 2
  if (formData.facilityNameFr && formData.facilityNameFr.length >= 3) institution += 8;
  if (formData.facilityNameAr) institution += 2;
  if (formData.legalRegistrationNumber) institution += 5;
  if (formData.contactPersonName) institution += 3;
  if (formData.phone) institution += 2;

  // Visibility (30%) - Step 3 (Location + Hours)
  if (formData.address) visibility += 8;
  if (formData.area) visibility += 4;
  if (formData.lat && formData.lng) visibility += 6;
  if (formData.is24_7) {
    visibility += 12;
  } else {
    // Check if at least 3 days have opening hours
    const openDays = Object.values(formData.schedule).filter(day => day.isOpen).length;
    if (openDays >= 3) visibility += 12;
    else if (openDays >= 1) visibility += 6;
  }

  // Enhancement (30%) - Step 4 & 5
  if (formData.serviceCategories.length >= 1) enhancement += 5;
  if (formData.serviceCategories.length >= 3) enhancement += 3;
  if (formData.specialties.length >= 1) enhancement += 4;
  if (formData.logoPreview) enhancement += 4;
  if (formData.galleryPreviews.length >= 1) enhancement += 4;
  if (formData.galleryPreviews.length >= 3) enhancement += 2;
  if (formData.description && formData.description.length >= 50) enhancement += 4;
  if (formData.description && formData.description.length >= 150) enhancement += 2;
  if (formData.languages.length >= 1) enhancement += 2;

  const total = identity + institution + visibility + enhancement;
  
  // isSearchable is true when total >= 70% (identity + institution + visibility complete)
  const isSearchable = (identity + institution + visibility) >= 50;

  return {
    total,
    identity,
    institution,
    visibility,
    enhancement,
    isSearchable,
  };
};

export const RegistrationProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<ProviderFormData>(getInitialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileScore, setProfileScore] = useState<ProfileScore>(calculateProfileScore(getInitialFormData()));
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restoredData = parsed.formData || getInitialFormData();
        setFormData(restoredData);
        setCurrentStep(parsed.currentStep || 1);
        setCompletedSteps(parsed.completedSteps || []);
        setProfileScore(calculateProfileScore(restoredData));
        if (parsed.lastSaved) {
          setLastSaved(new Date(parsed.lastSaved));
        }
      } catch (e) {
        console.warn('Failed to parse saved registration data');
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback(() => {
    setIsSaving(true);
    const saveData = {
      formData,
      currentStep,
      completedSteps,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    setLastSaved(new Date());
    setIsSaving(false);
  }, [formData, currentStep, completedSteps]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveToStorage();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [saveToStorage]);

  // Save on changes (debounced)
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, currentStep, completedSteps, saveToStorage]);

  // Recalculate score when form data changes
  useEffect(() => {
    setProfileScore(calculateProfileScore(formData));
  }, [formData]);

  const updateFormData = (data: Partial<ProviderFormData>) => {
    setFormData(prev => ({ ...prev, ...data, updatedAt: new Date().toISOString() }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    goToStep(Math.min(currentStep + 1, 6));
  };

  const prevStep = () => goToStep(Math.max(currentStep - 1, 1));

  const resetForm = () => {
    setFormData(getInitialFormData());
    setCurrentStep(1);
    setCompletedSteps([]);
    setLastSaved(null);
    setProfileScore(calculateProfileScore(getInitialFormData()));
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RegistrationContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
        completedSteps,
        setCompletedSteps,
        goToStep,
        nextStep,
        prevStep,
        resetForm,
        profileScore,
        lastSaved,
        isSaving,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
};
