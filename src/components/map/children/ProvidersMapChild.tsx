import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Filter, X, Clock, Building2, Search, MapPin } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const FILTERABLE_TYPES: ProviderType[] = [
  'hospital', 'clinic', 'doctor', 'pharmacy', 'lab', 'radiology_center'
];

const ProvidersMapChild = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  
  // Initialize filter state from URL params
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ProviderType>>(() => {
    const typesParam = searchParams.get('types');
    if (typesParam) {
      const types = typesParam.split(',').filter(t => FILTERABLE_TYPES.includes(t as ProviderType));
      return new Set(types as ProviderType[]);
    }
    return new Set();
  });
  const [openNowOnly, setOpenNowOnly] = useState(() => searchParams.get('open') === '1');
  
  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  
  // Marker refs for optimization
  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  
  // Translations
  const t = useMemo(() => ({
    fr: {
      filters: 'Filtres',
      clearFilters: 'Effacer',
      openNow: 'Ouvert maintenant',
      providerTypes: 'Types de prestataires',
      activeFilters: 'filtres actifs',
      search: 'Rechercher...',
      searchPlaceholder: 'Nom, spécialité, adresse...',
      noResults: 'Aucun résultat trouvé',
      results: 'résultats'
    },
    ar: {
      filters: 'الفلاتر',
      clearFilters: 'مسح',
      openNow: 'مفتوح الآن',
      providerTypes: 'أنواع مقدمي الخدمة',
      activeFilters: 'فلاتر نشطة',
      search: 'بحث...',
      searchPlaceholder: 'الاسم، التخصص، العنوان...',
      noResults: 'لم يتم العثور على نتائج',
      results: 'نتائج'
    },
    en: {
      filters: 'Filters',
      clearFilters: 'Clear',
      openNow: 'Open now',
      providerTypes: 'Provider types',
      activeFilters: 'active filters',
      search: 'Search...',
      searchPlaceholder: 'Name, specialty, address...',
      noResults: 'No results found',
      results: 'results'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedTypes.size > 0) {
      params.set('types', Array.from(selectedTypes).join(','));
    }
    if (openNowOnly) {
      params.set('open', '1');
    }
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    setSearchParams(params, { replace: true });
  }, [selectedTypes, openNowOnly, searchQuery, setSearchParams]);
  
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
    setSearchQuery('');
  };
  
  // Active filter count
  const activeFilterCount = selectedTypes.size + (openNowOnly ? 1 : 0) + (searchQuery ? 1 : 0);
  
  // Filter providers
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      // Text search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSpecialty = (p.specialty || '').toLowerCase().includes(query);
        const matchesAddress = p.address.toLowerCase().includes(query);
        const matchesType = p.type.toLowerCase().includes(query);
        if (!matchesName && !matchesSpecialty && !matchesAddress && !matchesType) {
          return false;
        }
      }
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
  }, [providers, selectedTypes, openNowOnly, searchQuery]);
  
  // Search suggestions (top 8 matches)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    return providers
      .filter(p => {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSpecialty = (p.specialty || '').toLowerCase().includes(query);
        const matchesAddress = p.address.toLowerCase().includes(query);
        return matchesName || matchesSpecialty || matchesAddress;
      })
      .slice(0, 8);
  }, [providers, searchQuery]);
  
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
  
  // Handle search result selection (fly to provider)
  const handleSearchSelect = useCallback((provider: CityHealthProvider) => {
    setSearchOpen(false);
    setSearchQuery(provider.name);
    handleProviderClick(provider);
  }, [handleProviderClick]);
  
  // Optimized marker management
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    
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
    
    existingMarkers.forEach((marker, id) => {
      if (!currentProviderIds.has(id)) {
        markerGroup.removeLayer(marker);
        existingMarkers.delete(id);
      }
    });
    
    filteredProviders.forEach(provider => {
      const isSelected = selectedProvider?.id === provider.id;
      
      if (existingMarkers.has(provider.id)) {
        const marker = existingMarkers.get(provider.id)!;
        marker.setIcon(createMarkerIcon(provider.type, isSelected, provider.emergency));
      } else {
        const marker = L.marker([provider.lat, provider.lng], {
          icon: createMarkerIcon(provider.type, isSelected, provider.emergency)
        });
        
        marker.on('click', () => handleProviderClick(provider));
        markerGroup.addLayer(marker);
        existingMarkers.set(provider.id, marker);
      }
    });
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
      {/* Search Bar */}
      <div className={cn(
        "absolute top-4 z-20 w-72 md:w-96",
        isRTL ? "right-4" : "left-4"
      )}>
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    setSearchOpen(true);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) {
                    setSearchOpen(true);
                  }
                }}
                placeholder={tx.searchPlaceholder}
                className={cn(
                  "shadow-lg bg-background/95 backdrop-blur-sm border-border/50",
                  isRTL ? "pr-10 pl-10" : "pl-10 pr-10"
                )}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-6 w-6",
                    isRTL ? "left-2" : "right-2"
                  )}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-72 md:w-96 p-0" 
            align={isRTL ? "end" : "start"}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                {searchSuggestions.length === 0 ? (
                  <CommandEmpty>{tx.noResults}</CommandEmpty>
                ) : (
                  <CommandGroup heading={`${searchSuggestions.length} ${tx.results}`}>
                    {searchSuggestions.map((provider) => (
                      <CommandItem
                        key={provider.id}
                        value={provider.name}
                        onSelect={() => handleSearchSelect(provider)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="flex-shrink-0 mt-0.5">
                            <span className="text-lg">
                              {PROVIDER_TYPE_LABELS[provider.type]?.icon || '📍'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{provider.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {provider.specialty || PROVIDER_TYPE_LABELS[provider.type]?.fr}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{provider.address}</span>
                            </div>
                          </div>
                          {provider.isOpen && (
                            <Badge variant="secondary" className="text-[10px] h-5 flex-shrink-0">
                              {tx.openNow}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
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