import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Filter, X, Clock, Building2 } from 'lucide-react';
import { useMapContext } from '@/contexts/MapContext';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { ProviderCard } from '../ProviderCard';
import { ProviderList } from '../ProviderList';
import { createMarkerIcon } from '../MapMarkers';
import { CityHealthProvider, ProviderType, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const FILTERABLE_TYPES: ProviderType[] = [
  'hospital', 'clinic', 'doctor', 'pharmacy', 'lab', 'radiology_center'
];

const ProvidersMapChild = () => {
  const { 
    mapRef, 
    isReady, 
    registerMarkerLayer, 
    removeMarkerLayer,
    selectedProvider,
    setSelectedProvider,
    flyTo,
    geolocation,
    isRTL
  } = useMapContext();
  const { language } = useLanguage();
  
  const { data: providers = [], isLoading } = useVerifiedProviders();
  
  // Filter state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ProviderType>>(new Set());
  const [openNowOnly, setOpenNowOnly] = useState(false);
  
  // Marker refs for optimization (Phase 5)
  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  
  // Translations
  const t = useMemo(() => ({
    fr: {
      filters: 'Filtres',
      clearFilters: 'Effacer',
      openNow: 'Ouvert maintenant',
      providerTypes: 'Types de prestataires',
      activeFilters: 'filtres actifs'
    },
    ar: {
      filters: 'الفلاتر',
      clearFilters: 'مسح',
      openNow: 'مفتوح الآن',
      providerTypes: 'أنواع مقدمي الخدمة',
      activeFilters: 'فلاتر نشطة'
    },
    en: {
      filters: 'Filters',
      clearFilters: 'Clear',
      openNow: 'Open now',
      providerTypes: 'Provider types',
      activeFilters: 'active filters'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
  // Toggle type filter
  const toggleType = (type: ProviderType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes(new Set());
    setOpenNowOnly(false);
  };
  
  // Active filter count
  const activeFilterCount = selectedTypes.size + (openNowOnly ? 1 : 0);
  
  // Filter providers
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      // Type filter
      if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) {
        return false;
      }
      // Open now filter
      if (openNowOnly && !p.isOpen) {
        return false;
      }
      return true;
    });
  }, [providers, selectedTypes, openNowOnly]);
  
  // Calculate distances
  const distances = useMemo(() => {
    const map = new Map<string, number>();
    filteredProviders.forEach(p => {
      const dist = geolocation.getDistanceFromUser(p.lat, p.lng);
      if (dist !== null) map.set(p.id, dist);
    });
    return map;
  }, [filteredProviders, geolocation]);
  
  // Sort by distance
  const sortedProviders = useMemo(() => {
    return [...filteredProviders].sort((a, b) => {
      const distA = distances.get(a.id) ?? 999;
      const distB = distances.get(b.id) ?? 999;
      return distA - distB;
    });
  }, [filteredProviders, distances]);
  
  // Handle provider click
  const handleProviderClick = useCallback((provider: CityHealthProvider) => {
    setSelectedProvider(provider);
    flyTo(provider.lat, provider.lng, 16);
  }, [setSelectedProvider, flyTo]);
  
  // Phase 5: Optimized marker management - create once, update styles
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    
    // If no marker group exists, create it
    if (!markerGroupRef.current) {
      markerGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
      });
      registerMarkerLayer('providers', markerGroupRef.current);
    }
    
    const markerGroup = markerGroupRef.current;
    const existingMarkers = markersMapRef.current;
    const currentProviderIds = new Set(filteredProviders.map(p => p.id));
    
    // Remove markers for providers no longer in filtered list
    existingMarkers.forEach((marker, id) => {
      if (!currentProviderIds.has(id)) {
        markerGroup.removeLayer(marker);
        existingMarkers.delete(id);
      }
    });
    
    // Add/update markers for filtered providers
    filteredProviders.forEach(provider => {
      const isSelected = selectedProvider?.id === provider.id;
      
      if (existingMarkers.has(provider.id)) {
        // Update existing marker icon (Phase 5 optimization)
        const marker = existingMarkers.get(provider.id)!;
        marker.setIcon(createMarkerIcon(provider.type, isSelected, provider.emergency));
      } else {
        // Create new marker
        const marker = L.marker([provider.lat, provider.lng], {
          icon: createMarkerIcon(provider.type, isSelected, provider.emergency)
        });
        
        marker.on('click', () => handleProviderClick(provider));
        markerGroup.addLayer(marker);
        existingMarkers.set(provider.id, marker);
      }
    });
    
    return () => {
      // Only cleanup when unmounting, not on filter changes
    };
  }, [isReady, mapRef, filteredProviders, selectedProvider?.id, registerMarkerLayer, handleProviderClick]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerGroupRef.current) {
        removeMarkerLayer('providers');
        markerGroupRef.current = null;
        markersMapRef.current.clear();
      }
    };
  }, [removeMarkerLayer]);
  
  return (
    <>
      {/* Filter Panel */}
      <div className={cn(
        "absolute top-16 z-10",
        isRTL ? "right-4" : "left-4"
      )}>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="secondary" 
              size="sm" 
              className="shadow-lg bg-background/90 backdrop-blur-sm gap-2"
            >
              <Filter className="h-4 w-4" />
              {tx.filters}
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-4 w-64 space-y-4">
              {/* Header with clear button */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{tx.filters}</span>
                {activeFilterCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    {tx.clearFilters}
                  </Button>
                )}
              </div>
              
              {/* Open Now Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="open-now" className="flex items-center gap-2 text-sm cursor-pointer">
                  <Clock className="h-4 w-4 text-green-600" />
                  {tx.openNow}
                </Label>
                <Switch
                  id="open-now"
                  checked={openNowOnly}
                  onCheckedChange={setOpenNowOnly}
                />
              </div>
              
              {/* Provider Types */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {tx.providerTypes}
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {FILTERABLE_TYPES.map(type => {
                    const label = PROVIDER_TYPE_LABELS[type];
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.has(type)}
                          onCheckedChange={() => toggleType(type)}
                        />
                        <Label 
                          htmlFor={`type-${type}`} 
                          className="text-sm cursor-pointer flex items-center gap-1"
                        >
                          <span>{label.icon}</span>
                          <span>{language === 'ar' ? label.ar : label.fr}</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Active filter count */}
              {activeFilterCount > 0 && (
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  {activeFilterCount} {tx.activeFilters}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      <ProviderList 
        providers={sortedProviders}
        loading={isLoading}
        distances={distances}
        onProviderClick={handleProviderClick}
      />
      
      {selectedProvider && (
        <ProviderCard 
          provider={selectedProvider}
          distance={distances.get(selectedProvider.id)}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </>
  );
};

export default ProvidersMapChild;