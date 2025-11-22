import { CheckCircle2, Shield, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  type?: 'verified' | 'premium' | 'certified';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const VerifiedBadge = ({ 
  type = 'verified', 
  size = 'md',
  showTooltip = true 
}: VerifiedBadgeProps) => {
  const configs = {
    verified: {
      icon: CheckCircle2,
      label: 'Vérifié',
      tooltip: 'Ce prestataire a été vérifié par CityHealth et a fourni tous les documents nécessaires.',
      className: 'bg-primary/10 text-primary border-primary/20'
    },
    premium: {
      icon: Shield,
      label: 'Premium',
      tooltip: 'Prestataire premium avec des services de haute qualité et une excellente réputation.',
      className: 'bg-accent/10 text-accent-foreground border-accent/20'
    },
    certified: {
      icon: Award,
      label: 'Certifié',
      tooltip: 'Détient des certifications professionnelles reconnues et à jour.',
      className: 'bg-secondary/30 text-secondary-foreground border-secondary/40'
    }
  };

  const config = configs[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const badge = (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} font-medium border flex items-center gap-1`}
    >
      <Icon size={iconSizes[size]} />
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
