import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { ProgressIndicator } from '@/components/provider/registration/ProgressIndicator';
import { Step1AccountCreation } from '@/components/provider/registration/Step1AccountCreation';
import { Step2BasicInfo } from '@/components/provider/registration/Step2BasicInfo';
import { Step3Location } from '@/components/provider/registration/Step3Location';
import { Step4Services } from '@/components/provider/registration/Step4Services';
import { Step5Profile } from '@/components/provider/registration/Step5Profile';
import { Step6Review } from '@/components/provider/registration/Step6Review';
import { ProviderFormData, getInitialFormData } from '@/components/provider/registration/types';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  { number: 1, title: 'Compte', description: 'Créer votre compte' },
  { number: 2, title: 'Établissement', description: 'Informations de base' },
  { number: 3, title: 'Localisation', description: 'Adresse & horaires' },
  { number: 4, title: 'Services', description: 'Spécialisations' },
  { number: 5, title: 'Profil', description: 'Photos & description' },
  { number: 6, title: 'Validation', description: 'Vérifier & soumettre' },
];

export default function ProviderRegister() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<ProviderFormData>(getInitialFormData);

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ch_provider_registration_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData);
        setCurrentStep(parsed.currentStep || 1);
        setCompletedSteps(parsed.completedSteps || []);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ch_provider_registration_draft', JSON.stringify({
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

  const handleSaveAndExit = () => {
    toast({
      title: "Progression sauvegardée",
      description: "Vous pouvez reprendre votre inscription plus tard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Inscription Professionnel
          </h1>
          <p className="text-muted-foreground">
            Rejoignez CityHealth et connectez-vous avec des milliers de patients
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressIndicator 
            steps={STEPS} 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={handleSaveAndExit}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder et quitter
          </Button>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
          <CardContent className="p-6 md:p-8">
            {currentStep === 1 && (
              <Step1AccountCreation 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
              />
            )}
            {currentStep === 2 && (
              <Step2BasicInfo 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            {currentStep === 3 && (
              <Step3Location 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            {currentStep === 4 && (
              <Step4Services 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            {currentStep === 5 && (
              <Step5Profile 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            {currentStep === 6 && (
              <Step6Review 
                formData={formData} 
                onPrev={prevStep} 
                onEditStep={goToStep} 
              />
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Besoin d'aide ? <a href="/contact" className="text-primary hover:underline">Contactez-nous</a>
        </p>
      </div>
    </div>
  );
}
