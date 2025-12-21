import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { 
  Hospital, Building2, User, Pill, FlaskConical, 
  Droplet, Maximize2, Minimize2, LocateFixed, Filter,
  Phone, MapPin, Clock, Star, Navigation, X, ChevronDown,
  AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGeolocation, SIDI_BEL_ABBES_CENTER } from '@/hooks/useGeolocation';
import { CityHealthProvider, ProviderType } from '@/data/providers';
import { useVerifiedProviders, useEmergencyProviders, useBloodCenters } from '@/hooks/useProviders';
import { cn } from '@/lib/utils';

export type MapMode = 'all' | 'emergency' | 'blood';

interface CityHealthMapProps {
  mode?: MapMode;
  className?: string;
  showFilters?: boolean;
  showProviderList?: boolean;
}

interface ProviderWithDistance extends CityHealthProvider {
  distanceFromUser?: number | null;
}

// Marker icon creation by provider type
const createMarkerIcon = (type: ProviderType, isSelected: boolean = false) => {
  const colors: Record<ProviderType, string> = {
    hospital: '#dc2626',
    birth_hospital: '#ec4899',
    clinic: '#2563eb',
    doctor: '#059669',
    pharmacy: '#7c3aed',
    lab: '#d97706',
    radiology_center: '#0891b2',
    blood_cabin: '#e11d48',
    medical_equipment: '#6b7280'
  };
  
  const icons: Record<ProviderType, string> = {
    hospital: '🏥',
    birth_hospital: '👶',
    clinic: '🏢',
    doctor: '👨‍⚕️',
    pharmacy: '💊',
    lab: '🔬',
    radiology_center: '📡',
    blood_cabin: '🩸',
    medical_equipment: '🩺'
  };
  
  const color = colors[type] || '#6b7280';
  const icon = icons[type] || '📍';
  const size = isSelected ? 44 : 36;
  const border = isSelected ? '4px solid #22c55e' : '3px solid white';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${border};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.2s;
        transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
      ">
        <span style="font-size: ${isSelected ? 18 : 14}px;">${icon}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

const getTypeIcon = (type: ProviderType) => {
  const icons: Record<ProviderType, typeof Hospital> = {
    hospital: Hospital,
    birth_hospital: Hospital,
    clinic: Building2,
    doctor: User,
    pharmacy: Pill,
    lab: FlaskConical,
    radiology_center: FlaskConical,
    blood_cabin: Droplet,
    medical_equipment: Building2
  };
  return icons[type] || Building2;
};

export function CityHealthMap({ 
  mode = 'all', 
  className,
  showFilters = true,
  showProviderList = true 
}: CityHealthMapProps) {
  const { isRTL, language } = useLanguage();
  const geolocation = useGeolocation();
  
  // Use TanStack Query hooks based on mode for optimal caching
  const { 
    data: verifiedProviders = [], 
    isLoading: loadingAll, 
    error: errorAll,
    refetch: refetchAll 
  } = useVerifiedProviders();
  
  const { 
    data: emergencyProviders = [], 
    isLoading: loadingEmergency, 
    error: errorEmergency,
    refetch: refetchEmergency 
  } = useEmergencyProviders();
  
  const { 
    data: bloodProviders = [], 
    isLoading: loadingBlood, 
    error: errorBlood,
    refetch: refetchBlood 
  } = useBloodCenters();
  
  // Select providers based on mode
  const providers = useMemo(() => {
    switch (mode) {
      case 'emergency':
        return emergencyProviders;
      case 'blood':
        return bloodProviders;
      default:
        return verifiedProviders;
    }
  }, [mode, verifiedProviders, emergencyProviders, bloodProviders]);
  
  const loading = mode === 'emergency' ? loadingEmergency : mode === 'blood' ? loadingBlood : loadingAll;
  const error = mode === 'emergency' ? errorEmergency : mode === 'blood' ? errorBlood : errorAll;
  const refetch = mode === 'emergency' ? refetchEmergency : mode === 'blood' ? refetchBlood : refetchAll;
  
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithDistance | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filters
  const [typeFilters, setTypeFilters] = useState<ProviderType[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  
  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  
  // Translations
  const t = useMemo(() => ({
    fr: {
      allProviders: 'Tous les prestataires',
      emergency: 'Services d\'urgence',
      blood: 'Don de sang',
      filters: 'Filtres',
      openNow: 'Ouvert maintenant',
      locateMe: 'Me localiser',
      noResults: 'Aucun prestataire trouvé',
      providers: 'Prestataires',
      call: 'Appeler',
      directions: 'Itinéraire',
      close: 'Fermer',
      retry: 'Réessayer',
      errorLoading: 'Erreur de chargement',
      errorDescription: 'Impossible de charger les prestataires. Veuillez réessayer.',
      emptyTitle: 'Aucun prestataire',
      emptyDescription: 'Aucun prestataire n\'a encore été enregistré dans cette catégorie.',
      types: {
        hospital: 'Hôpital',
        birth_hospital: 'Maternité',
        clinic: 'Clinique',
        doctor: 'Médecin',
        pharmacy: 'Pharmacie',
        lab: 'Laboratoire',
        radiology_center: 'Radiologie',
        blood_cabin: 'Centre de sang',
        medical_equipment: 'Équipement médical'
      }
    },
    ar: {
      allProviders: 'جميع مقدمي الخدمات',
      emergency: 'خدمات الطوارئ',
      blood: 'التبرع بالدم',
      filters: 'المرشحات',
      openNow: 'مفتوح الآن',
      locateMe: 'حدد موقعي',
      noResults: 'لم يتم العثور على مقدمي خدمات',
      providers: 'مقدمو الخدمات',
      call: 'اتصل',
      directions: 'الاتجاهات',
      close: 'إغلاق',
      retry: 'إعادة المحاولة',
      errorLoading: 'خطأ في التحميل',
      errorDescription: 'تعذر تحميل مقدمي الخدمات. يرجى المحاولة مرة أخرى.',
      emptyTitle: 'لا يوجد مقدمو خدمات',
      emptyDescription: 'لم يتم تسجيل أي مقدمي خدمات في هذه الفئة بعد.',
      types: {
        hospital: 'مستشفى',
        birth_hospital: 'الولادة',
        clinic: 'عيادة',
        doctor: 'طبيب',
        pharmacy: 'صيدلية',
        lab: 'مختبر',
        radiology_center: 'أشعة',
        blood_cabin: 'مركز الدم',
        medical_equipment: 'معدات طبية'
      }
    },
    en: {
      allProviders: 'All providers',
      emergency: 'Emergency services',
      blood: 'Blood donation',
      filters: 'Filters',
      openNow: 'Open now',
      locateMe: 'Locate me',
      noResults: 'No providers found',
      providers: 'Providers',
      call: 'Call',
      directions: 'Directions',
      close: 'Close',
      retry: 'Retry',
      errorLoading: 'Loading Error',
      errorDescription: 'Unable to load providers. Please try again.',
      emptyTitle: 'No Providers',
      emptyDescription: 'No providers have been registered in this category yet.',
      types: {
        hospital: 'Hospital',
        birth_hospital: 'Maternity',
        clinic: 'Clinic',
        doctor: 'Doctor',
        pharmacy: 'Pharmacy',
        lab: 'Laboratory',
        radiology_center: 'Radiology',
        blood_cabin: 'Blood center',
        medical_equipment: 'Medical equipment'
      }
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
  const modeTitle = {
    all: tx.allProviders,
    emergency: tx.emergency,
    blood: tx.blood
  };
  
  // Filter providers by user filters (mode filtering is already done by the hooks)
  const filteredProviders = useMemo((): ProviderWithDistance[] => {
    let result = [...providers];
    
    // Type filter
    if (typeFilters.length > 0) {
      result = result.filter(p => typeFilters.includes(p.type));
    }
    
    // Open now filter
    if (openNowOnly) {
      result = result.filter(p => p.isOpen);
    }
    
    // Add distance and sort
    return result.map(p => ({
      ...p,
      distanceFromUser: geolocation.getDistanceFromUser(p.lat, p.lng)
    })).sort((a, b) => (a.distanceFromUser || Infinity) - (b.distanceFromUser || Infinity));
  }, [providers, typeFilters, openNowOnly, geolocation]);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [SIDI_BEL_ABBES_CENTER.lat, SIDI_BEL_ABBES_CENTER.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // @ts-ignore - MarkerClusterGroup is added by the plugin
    const markers = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16
    });

    map.addLayer(markers);
    markersRef.current = markers;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);
  
  // Update markers
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    markersRef.current.clearLayers();

    filteredProviders.forEach(provider => {
      const marker = L.marker([provider.lat, provider.lng], {
        icon: createMarkerIcon(provider.type, selectedProvider?.id === provider.id)
      });

      marker.bindTooltip(provider.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -36]
      });

      marker.on('click', () => {
        setSelectedProvider(provider);
        mapRef.current?.flyTo([provider.lat, provider.lng], 16, { duration: 0.5 });
      });

      markersRef.current?.addLayer(marker);
    });
  }, [filteredProviders, selectedProvider]);
  
  // Fly to selected provider
  useEffect(() => {
    if (selectedProvider && mapRef.current) {
      mapRef.current.flyTo([selectedProvider.lat, selectedProvider.lng], 16, { duration: 0.5 });
    }
  }, [selectedProvider]);
  
  const handleLocateMe = useCallback(() => {
    geolocation.getCurrentPosition();
    if (geolocation.hasLocation && mapRef.current) {
      mapRef.current.flyTo([geolocation.latitude!, geolocation.longitude!], 15, { duration: 0.5 });
    }
  }, [geolocation]);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => mapRef.current?.invalidateSize(), 100);
  }, [isFullscreen]);
  
  const handleProviderClick = useCallback((provider: ProviderWithDistance) => {
    setSelectedProvider(provider);
  }, []);
  
  const getDirections = useCallback((provider: CityHealthProvider) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`;
    window.open(url, '_blank');
  }, []);
  
  const toggleTypeFilter = (type: ProviderType) => {
    setTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const availableTypes = useMemo(() => {
    const types = new Set(providers.map(p => p.type));
    return Array.from(types) as ProviderType[];
  }, [providers]);
  
  const TypeIcon = selectedProvider ? getTypeIcon(selectedProvider.type) : Hospital;

  return (
    <div className={cn(
      "flex flex-col lg:flex-row gap-4",
      isFullscreen && "fixed inset-0 z-50 bg-background p-4",
      className
    )}>
      {/* Map Container */}
      <div className={cn("flex-1 relative", isFullscreen ? "h-full" : "h-[500px] lg:h-[700px]")}>
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg"
            onClick={handleLocateMe}
          >
            <LocateFixed className="h-4 w-4 mr-2" />
            {tx.locateMe}
          </Button>
          
          {showFilters && (
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="secondary" className="shadow-lg">
                  <Filter className="h-4 w-4 mr-2" />
                  {tx.filters}
                  <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", filtersOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Card className="w-64 shadow-lg">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="open-now" 
                        checked={openNowOnly}
                        onCheckedChange={(checked) => setOpenNowOnly(!!checked)}
                      />
                      <Label htmlFor="open-now" className="text-sm">{tx.openNow}</Label>
                    </div>
                    <div className="border-t pt-2 space-y-2">
                      {availableTypes.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`type-${type}`}
                            checked={typeFilters.includes(type)}
                            onCheckedChange={() => toggleTypeFilter(type)}
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm">
                            {tx.types[type as keyof typeof tx.types] || type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
        
        {/* Fullscreen toggle */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 right-4 z-[1000] shadow-lg"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        
        {/* Map */}
        {error ? (
          <div className="w-full h-full rounded-xl border flex items-center justify-center bg-muted/20">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>{tx.errorLoading}</AlertTitle>
              <AlertDescription className="mt-2">
                {tx.errorDescription}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {tx.retry}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : loading ? (
          <div className="w-full h-full rounded-xl border flex flex-col items-center justify-center gap-4 bg-muted/20">
            <Skeleton className="w-full h-full rounded-xl absolute inset-0" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground text-sm">{tx.allProviders}...</p>
            </div>
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden border" />
        )}
        
        {/* Selected Provider Card Overlay */}
        {selectedProvider && (
          <Card className="absolute bottom-4 left-4 right-4 z-[1000] lg:left-4 lg:right-auto lg:w-80 shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{selectedProvider.name}</CardTitle>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setSelectedProvider(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{selectedProvider.address}</span>
              </div>
              
              {selectedProvider.distanceFromUser && (
                <Badge variant="secondary">
                  <Navigation className="h-3 w-3 mr-1" />
                  {selectedProvider.distanceFromUser.toFixed(1)} km
                </Badge>
              )}
              
              <div className="flex items-center gap-2">
                {selectedProvider.isOpen && (
                  <Badge className="bg-green-500/10 text-green-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {tx.openNow}
                  </Badge>
                )}
                {selectedProvider.rating && (
                  <Badge variant="outline">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {selectedProvider.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <a href={`tel:${selectedProvider.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    {tx.call}
                  </a>
                </Button>
                <Button size="sm" className="flex-1" onClick={() => getDirections(selectedProvider)}>
                  <Navigation className="h-4 w-4 mr-2" />
                  {tx.directions}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-background/90 backdrop-blur p-2 rounded-lg border text-xs hidden lg:block">
          <div className="font-medium mb-1">{modeTitle[mode]}</div>
          <div className="text-muted-foreground">{filteredProviders.length} {tx.providers}</div>
        </div>
      </div>
      
      {/* Provider List Sidebar */}
      {showProviderList && !isFullscreen && (
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="h-[400px] lg:h-[700px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                {modeTitle[mode]}
                <Badge variant="secondary">{filteredProviders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[340px] lg:h-[620px]">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : filteredProviders.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {tx.noResults}
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredProviders.map(provider => {
                      const Icon = getTypeIcon(provider.type);
                      return (
                        <button
                          key={provider.id}
                          onClick={() => handleProviderClick(provider)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-all hover:bg-accent/50",
                            selectedProvider?.id === provider.id && "ring-2 ring-primary bg-accent"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{provider.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {provider.address}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {provider.isOpen && (
                                  <Badge variant="outline" className="text-xs h-5 text-green-600 border-green-300">
                                    {tx.openNow}
                                  </Badge>
                                )}
                                {provider.distanceFromUser && (
                                  <span className="text-xs text-muted-foreground">
                                    {provider.distanceFromUser.toFixed(1)} km
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Export as both named and default for flexibility
export default CityHealthMap;
