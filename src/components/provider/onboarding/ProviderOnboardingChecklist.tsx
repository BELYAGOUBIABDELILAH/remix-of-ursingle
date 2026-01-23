import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, Sparkles } from 'lucide-react';
import { CityHealthProvider } from '@/data/providers';
import { useProviderOnboarding } from '@/hooks/useProviderOnboarding';
import { OnboardingStep } from './OnboardingStep';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProviderOnboardingChecklistProps {
  providerData: CityHealthProvider | null;
  verificationStatus?: string;
  onNavigateToTab: (tab: string) => void;
  className?: string;
}

export function ProviderOnboardingChecklist({
  providerData,
  verificationStatus,
  onNavigateToTab,
  className,
}: ProviderOnboardingChecklistProps) {
  const {
    steps,
    currentStepIndex,
    completedSteps,
    totalSteps,
    overallProgress,
    isOnboardingComplete,
    milestones,
  } = useProviderOnboarding(providerData, verificationStatus);

  const handleStepAction = (step: typeof steps[0]) => {
    if (step.action.tab) {
      onNavigateToTab(step.action.tab);
      
      // Scroll to specific section if specified
      if (step.action.scrollTo) {
        setTimeout(() => {
          const element = document.getElementById(step.action.scrollTo!);
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  };

  const getStatusMessage = () => {
    if (milestones.verified) {
      return {
        icon: <Sparkles className="h-5 w-5 text-green-500" />,
        text: 'Félicitations ! Votre profil est vérifié.',
        variant: 'success' as const,
      };
    }
    if (milestones.verificationSubmitted) {
      return {
        icon: <Target className="h-5 w-5 text-primary" />,
        text: 'En attente de vérification par notre équipe.',
        variant: 'pending' as const,
      };
    }
    if (milestones.profileComplete) {
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />,
        text: 'Profil complet ! Téléchargez vos documents.',
        variant: 'info' as const,
      };
    }
    if (milestones.halfwayComplete) {
      return {
        icon: <Target className="h-5 w-5 text-amber-500" />,
        text: 'Vous êtes à mi-chemin ! Continuez.',
        variant: 'warning' as const,
      };
    }
    return {
      icon: <Target className="h-5 w-5 text-muted-foreground" />,
      text: 'Complétez votre profil pour être visible.',
      variant: 'default' as const,
    };
  };

  const status = getStatusMessage();

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Votre parcours d'inscription
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {status.icon}
              {status.text}
            </CardDescription>
          </div>
          <div className="text-right">
            <motion.span
              key={overallProgress}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'text-3xl font-bold',
                isOnboardingComplete ? 'text-green-500' : 'text-primary'
              )}
            >
              {overallProgress}%
            </motion.span>
            <p className="text-xs text-muted-foreground">
              {completedSteps}/{totalSteps} étapes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-2">
          <Progress value={overallProgress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  step.isComplete
                    ? 'bg-green-500'
                    : index === currentStepIndex
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Milestone badges */}
        {(milestones.halfwayComplete || milestones.profileComplete) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {milestones.halfwayComplete && !milestones.profileComplete && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                🎯 Mi-parcours atteint
              </Badge>
            )}
            {milestones.profileComplete && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                ✅ Profil complet
              </Badge>
            )}
            {milestones.documentsUploaded && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                📄 Documents téléchargés
              </Badge>
            )}
            {milestones.verified && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                ✓ Vérifié
              </Badge>
            )}
          </div>
        )}

        {/* Steps list */}
        <div className="space-y-1">
          {steps.map((step, index) => (
            <OnboardingStep
              key={step.id}
              step={step}
              stepNumber={index + 1}
              isCurrentStep={index === currentStepIndex}
              onAction={() => handleStepAction(step)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
