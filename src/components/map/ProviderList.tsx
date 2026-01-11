import { useMemo } from 'react';
import { 
  MapPin, 
  Star, 
  BadgeCheck, 
  AlertTriangle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CityHealthProvider, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { useMapContext } from '@/contexts/MapContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ProviderListProps {
  providers: CityHealthProvider[];
  loading?: boolean;
  distances?: Map<string, number>;
  onProviderClick?: (provider: CityHealthProvider) => void;
}

export const ProviderList = ({ 
  providers, 
  loading, 
  distances,
  onProviderClick 
}: ProviderListProps) => {
  const { selectedProvider, isRTL } = useMapContext();
  const { language } = useLanguage();
  
  const t = useMemo(() => ({
    fr: {
      noResults: 'Aucun prestataire trouvé',
      km: 'km',
      open: 'Ouvert',
      verified: 'Vérifié',
      providers: 'prestataires'
    },
    ar: {
      noResults: 'لم يتم العثور على مقدمين',
      km: 'كم',
      open: 'مفتوح',
      verified: 'موثق',
      providers: 'مقدمين'
    },
    en: {
      noResults: 'No providers found',
      km: 'km',
      open: 'Open',
      verified: 'Verified',
      providers: 'providers'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
  if (loading) {
    return (
      <div className={cn(
        "absolute top-16 z-10 w-80 max-h-[60vh] bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden",
        isRTL ? "left-4" : "right-4"
      )}>
        <div className="p-3 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-16 h-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (providers.length === 0) {
    return (
      <div className={cn(
        "absolute top-16 z-10 w-80 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-4 text-center",
        isRTL ? "left-4" : "right-4"
      )}>
        <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">{tx.noResults}</p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "absolute top-16 z-10 w-80 max-h-[60vh] bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden",
      isRTL ? "left-4" : "right-4"
    )}>
      {/* Header */}
      <div className="px-3 py-2 border-b bg-muted/50">
        <span className="text-sm font-medium">
          {providers.length} {tx.providers}
        </span>
      </div>
      
      {/* List */}
      <ScrollArea className="h-[calc(60vh-40px)]">
        <div className="p-2 space-y-2">
          {providers.map(provider => {
            const distance = distances?.get(provider.id);
            const isSelected = selectedProvider?.id === provider.id;
            const typeLabel = PROVIDER_TYPE_LABELS[provider.type]?.[language === 'en' ? 'fr' : language as 'fr' | 'ar'] || provider.type;
            
            return (
              <button
                key={provider.id}
                className={cn(
                  "w-full flex gap-3 p-2 rounded-lg text-left transition-colors",
                  "hover:bg-muted/80",
                  isSelected && "bg-primary/10 ring-1 ring-primary"
                )}
                onClick={() => onProviderClick?.(provider)}
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                  {provider.image && provider.image !== '/placeholder.svg' ? (
                    <img 
                      src={provider.image} 
                      alt={provider.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-medium text-sm truncate">{provider.name}</h4>
                    {provider.verified && (
                      <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate">
                    {typeLabel}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {distance !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {distance.toFixed(1)} {tx.km}
                      </span>
                    )}
                    
                    {provider.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs">{provider.rating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    {provider.emergency && (
                      <Badge variant="destructive" className="text-[10px] px-1 py-0">
                        24/7
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
