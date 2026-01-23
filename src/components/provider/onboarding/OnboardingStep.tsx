import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStep as OnboardingStepType } from '@/hooks/useProviderOnboarding';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OnboardingStepProps {
  step: OnboardingStepType;
  stepNumber: number;
  isCurrentStep: boolean;
  onAction: () => void;
}

export function OnboardingStep({
  step,
  stepNumber,
  isCurrentStep,
  onAction,
}: OnboardingStepProps) {
  const getIcon = () => {
    if (step.isComplete) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </motion.div>
      );
    }
    if (step.isBlocked) {
      return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
    if (isCurrentStep) {
      return (
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">{stepNumber}</span>
        </div>
      );
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const content = (
    <motion.div
      layout
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg transition-colors',
        isCurrentStep && !step.isComplete && 'bg-primary/5 border border-primary/20',
        step.isComplete && 'opacity-75',
        step.isBlocked && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-medium',
              step.isComplete && 'line-through text-muted-foreground',
              isCurrentStep && !step.isComplete && 'text-primary'
            )}
          >
            {step.title}
          </h4>
          {isCurrentStep && !step.isComplete && !step.isBlocked && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Prochaine étape
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>

        {/* Expanded content for current step */}
        <AnimatePresence>
          {isCurrentStep && !step.isComplete && !step.isBlocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3"
            >
              {step.helpText && (
                <p className="text-sm text-muted-foreground mb-3 italic">
                  💡 {step.helpText}
                </p>
              )}
              <Button size="sm" onClick={onAction} className="gap-2">
                {step.action.label}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chevron for completed steps */}
      {step.isComplete && (
        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
    </motion.div>
  );

  // Wrap blocked steps with tooltip
  if (step.isBlocked && step.blockedReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{content}</div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              {step.blockedReason}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
