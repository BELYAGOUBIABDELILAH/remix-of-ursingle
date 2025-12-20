import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ProviderFormData, getInitialFormData } from '@/components/provider/registration/types';

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
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

const STORAGE_KEY = 'ch_provider_registration_draft';

export const RegistrationProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<ProviderFormData>(getInitialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || getInitialFormData());
        setCurrentStep(parsed.currentStep || 1);
        setCompletedSteps(parsed.completedSteps || []);
      } catch (e) {
        console.warn('Failed to parse saved registration data');
      }
    }
  }, []);

  // Auto-save to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData,
      currentStep,
      completedSteps,
    }));
  }, [formData, currentStep, completedSteps]);

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
