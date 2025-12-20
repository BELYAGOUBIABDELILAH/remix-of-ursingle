import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { 
  MapPin, Navigation, Filter, Phone, Star, Clock, Search, 
  Building2, Stethoscope, Pill, FlaskConical, Maximize2,
  X, ChevronDown, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getProviders, CityHealthProvider, PROVIDER_TYPE_LABELS, ProviderType, toggleFavorite, isFavorite } from '@/data/providers';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Custom marker icons by provider type
const createMarkerIcon = (type: ProviderType) => {
  const colors: Record<ProviderType, string> = {
    hospital: '#ef4444',
    birth_hospital: '#f97316',
    clinic: '#3b82f6',
    doctor: '#22c55e',
    pharmacy: '#8b5cf6',
    lab: '#06b6d4',
    blood_cabin: '#dc2626',
    radiology_center: '#6366f1',
    medical_equipment: '#78716c'
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${colors[type]};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 12px; color: white;">${PROVIDER_TYPE_LABELS[type]?.icon || '📍'}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const ProvidersMapPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  
  const [providers, setProviders] = useState<CityHealthProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<CityHealthProvider | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  // Sidi Bel Abbès center
  const SBA_CENTER: L.LatLngExpression = [35.1975, -0.6300];

  // Load providers
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const allProviders = getProviders();
      // Only show verified and searchable providers
      const filtered = allProviders.filter(p => 
        p.verificationStatus === 'verified' && p.isPublic
      );
      setProviders(filtered);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter providers
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (openNowOnly && !p.isOpen) return false;
      if (selectedSpecialty !== 'all' && p.specialty !== selectedSpecialty) return false;
      return true;
    });
  }, [providers, searchQuery, selectedType, openNowOnly, selectedSpecialty]);

  // Get unique specialties
  const specialties = useMemo(() => {
    const specs = providers.map(p => p.specialty).filter(Boolean) as string[];
    return [...new Set(specs)];
  }, [providers]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SBA_CENTER,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add fullscreen control button
    L.Control.Fullscreen = L.Control.extend({
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', '', container);
        button.href = '#';
        button.innerHTML = '⛶';
        button.title = 'Plein écran';
        button.style.fontSize = '18px';
        button.style.lineHeight = '26px';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        L.DomEvent.on(button, 'click', function(e) {
          L.DomEvent.preventDefault(e);
          setIsFullscreen(prev => !prev);
        });
        return container;
      }
    });

    new L.Control.Fullscreen({ position: 'topright' }).addTo(map);

    // Create marker cluster group
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

  // Update markers when filtered providers change
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    markersRef.current.clearLayers();

    filteredProviders.forEach(provider => {
      const marker = L.marker([provider.lat, provider.lng], {
        icon: createMarkerIcon(provider.type)
      });

      marker.bindTooltip(provider.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -32]
      });

      marker.on('click', () => {
        setSelectedProvider(provider);
      });

      markersRef.current?.addLayer(marker);
    });
  }, [filteredProviders]);

  // Zoom to provider when selected
  useEffect(() => {
    if (selectedProvider && mapRef.current) {
      mapRef.current.flyTo([selectedProvider.lat, selectedProvider.lng], 16, {
        duration: 0.5
      });
    }
  }, [selectedProvider]);

  const handleProviderCardClick = (provider: CityHealthProvider) => {
    setSelectedProvider(provider);
  };

  const handleGetDirections = (provider: CityHealthProvider) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`,
      '_blank'
    );
  };

  const handleToggleFavorite = (provider: CityHealthProvider) => {
    const isNowFavorite = toggleFavorite(provider.id);
    toast.success(isNowFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
  };

  const getTypeIcon = (type: ProviderType) => {
    switch (type) {
      case 'hospital':
      case 'birth_hospital':
      case 'clinic':
        return <Building2 className="h-4 w-4" />;
      case 'doctor':
        return <Stethoscope className="h-4 w-4" />;
      case 'pharmacy':
        return <Pill className="h-4 w-4" />;
      case 'lab':
      case 'radiology_center':
        return <FlaskConical className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Carte Interactive des Prestataires</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredProviders.length} prestataires vérifiés à Sidi Bel Abbès
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4" />
                Filtres
                <ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de prestataire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Object.entries(PROVIDER_TYPE_LABELS).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.icon} {val.fr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes spécialités</SelectItem>
                    {specialties.map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Switch
                    id="open-now"
                    checked={openNowOnly}
                    onCheckedChange={setOpenNowOnly}
                  />
                  <Label htmlFor="open-now" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Ouvert maintenant
                  </Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className={cn("lg:col-span-2", isFullscreen && "lg:col-span-3")}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div 
                  ref={mapContainerRef} 
                  className={cn(
                    "w-full",
                    isFullscreen ? "h-[calc(100vh-180px)]" : "h-[600px]"
                  )}
                >
                  {isLoading && (
                    <div className="h-full flex items-center justify-center bg-muted">
                      <div className="text-center space-y-2">
                        <MapPin className="h-12 w-12 text-primary animate-pulse mx-auto" />
                        <p className="text-muted-foreground">Chargement de la carte...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Légende</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(PROVIDER_TYPE_LABELS).map(([key, val]) => (
                    <Badge 
                      key={key} 
                      variant="outline" 
                      className="flex items-center gap-1"
                    >
                      <span>{val.icon}</span>
                      <span>{val.fr}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider List */}
          {!isFullscreen && (
            <div className="lg:col-span-1">
              <Card className="h-[700px] flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Prestataires ({filteredProviders.length})</h2>
                    {selectedProvider && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedProvider(null)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Fermer
                      </Button>
                    )}
                  </div>

                  {/* Selected Provider Card */}
                  {selectedProvider && (
                    <Card className="mb-4 border-primary bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{selectedProvider.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {getTypeIcon(selectedProvider.type)}
                              <span className="ml-1">{PROVIDER_TYPE_LABELS[selectedProvider.type]?.fr}</span>
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorite(selectedProvider)}
                          >
                            <Heart className={cn("h-5 w-5", isFavorite(selectedProvider.id) && "fill-red-500 text-red-500")} />
                          </Button>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProvider.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProvider.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{selectedProvider.rating} ({selectedProvider.reviewsCount} avis)</span>
                          </div>
                          <Badge variant={selectedProvider.isOpen ? 'default' : 'secondary'}>
                            <Clock className="h-3 w-3 mr-1" />
                            {selectedProvider.isOpen ? 'Ouvert' : 'Fermé'}
                          </Badge>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleGetDirections(selectedProvider)}
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Itinéraire
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/provider/${selectedProvider.id}`)}
                          >
                            Voir profil
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Provider List */}
                  <ScrollArea className="flex-1">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : filteredProviders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun prestataire trouvé</p>
                        <p className="text-sm">Essayez d'ajuster vos filtres</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredProviders.map((provider) => (
                          <Card
                            key={provider.id}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              selectedProvider?.id === provider.id && "ring-2 ring-primary"
                            )}
                            onClick={() => handleProviderCardClick(provider)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{provider.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {PROVIDER_TYPE_LABELS[provider.type]?.icon}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs">
                                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                      <span>{provider.rating}</span>
                                    </div>
                                    <Badge 
                                      variant={provider.isOpen ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {provider.isOpen ? 'Ouvert' : 'Fermé'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvidersMapPage;
