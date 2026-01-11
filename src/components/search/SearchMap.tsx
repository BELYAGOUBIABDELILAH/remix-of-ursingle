import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Phone, Star, Navigation, Calendar, Loader2, Target, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/pages/SearchPage';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Tile URLs for light/dark modes
const TILE_URLS = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

interface SearchMapProps {
  providers: Provider[];
}

export const SearchMap = ({ providers }: SearchMapProps) => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const { isRTL, language } = useLanguage();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Translations
  const t = {
    fr: {
      loading: 'Chargement de la carte...',
      verified: 'Vérifié',
      call: 'Appeler',
      directions: 'Itinéraire',
      profile: 'Profil',
      distance: 'Distance',
      legend: 'Légende',
      verifiedProviders: 'Professionnels vérifiés',
      standardProviders: 'Professionnels standards',
      locateMe: 'Ma position',
      locationError: 'Impossible d\'obtenir votre position'
    },
    ar: {
      loading: 'جارٍ تحميل الخريطة...',
      verified: 'موثق',
      call: 'اتصل',
      directions: 'الاتجاهات',
      profile: 'الملف',
      distance: 'المسافة',
      legend: 'المفتاح',
      verifiedProviders: 'مهنيون موثوقون',
      standardProviders: 'مهنيون عاديون',
      locateMe: 'موقعي',
      locationError: 'تعذر الحصول على موقعك'
    },
    en: {
      loading: 'Loading map...',
      verified: 'Verified',
      call: 'Call',
      directions: 'Directions',
      profile: 'Profile',
      distance: 'Distance',
      legend: 'Legend',
      verifiedProviders: 'Verified professionals',
      standardProviders: 'Standard professionals',
      locateMe: 'My location',
      locationError: 'Unable to get your location'
    }
  };
  
  const tx = t[language as keyof typeof t] || t.fr;

  // Create marker icon
  const createIcon = useCallback((verified: boolean, isSelected: boolean = false) => {
    const color = verified ? '#1a73e8' : '#8b5cf6';
    const size = isSelected ? 40 : 32;
    const borderWidth = isSelected ? 4 : 2;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background-color: ${color};
          border: ${borderWidth}px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          ${isSelected ? 'transform: scale(1.2);' : ''}
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on Sidi Bel Abbès
    const map = L.map(mapContainerRef.current, {
      center: [35.1975, -0.6300],
      zoom: 12,
      zoomControl: false,
    });

    // Add zoom control
    L.control.zoom({
      position: isRTL ? 'topleft' : 'topright'
    }).addTo(map);

    // Add tile layer
    const tileUrl = theme === 'dark' ? TILE_URLS.dark : TILE_URLS.light;
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Create marker cluster group
    markerGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      showCoverageOnHover: false,
    });
    map.addLayer(markerGroupRef.current);

    mapRef.current = map;
    setIsMapLoaded(true);

    return () => {
      map.remove();
      mapRef.current = null;
      markerGroupRef.current = null;
      tileLayerRef.current = null;
    };
  }, [isRTL, theme]);

  // Update tile layer when theme changes
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const newUrl = theme === 'dark' ? TILE_URLS.dark : TILE_URLS.light;
    tileLayerRef.current.setUrl(newUrl);
  }, [theme]);

  // Update markers when providers change
  useEffect(() => {
    if (!mapRef.current || !markerGroupRef.current || !isMapLoaded) return;

    const markerGroup = markerGroupRef.current;
    markerGroup.clearLayers();

    providers.forEach((provider) => {
      const marker = L.marker([provider.lat, provider.lng], {
        icon: createIcon(provider.verified, selectedProvider?.id === provider.id)
      });

      marker.on('click', () => {
        setSelectedProvider(provider);
        mapRef.current?.flyTo([provider.lat, provider.lng], 15, { duration: 0.5 });
      });

      markerGroup.addLayer(marker);
    });

    // Fit bounds if we have providers
    if (providers.length > 0) {
      const bounds = L.latLngBounds(providers.map(p => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [providers, isMapLoaded, createIcon, selectedProvider?.id]);

  // Locate user
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: tx.locationError,
        variant: 'destructive',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setIsLocating(false);

        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 14);

          // Add/update user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userMarkerRef.current = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'user-marker',
                html: `
                  <div style="
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #4285f4;
                    border: 3px solid white;
                    box-shadow: 0 0 0 2px #4285f4, 0 2px 8px rgba(0,0,0,0.3);
                  "></div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })
            }).addTo(mapRef.current);
          }
        }
      },
      () => {
        setIsLocating(false);
        toast({
          title: tx.locationError,
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast, tx.locationError]);

  // Calculate distance
  const calculateDistance = useCallback((provider: Provider): number | null => {
    if (!userLocation) return null;
    
    const R = 6371;
    const dLat = (provider.lat - userLocation[0]) * Math.PI / 180;
    const dLon = (provider.lng - userLocation[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(provider.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  }, [userLocation]);

  // Get directions
  const getDirections = useCallback((provider: Provider) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${provider.lat},${provider.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`;
      window.open(url, '_blank');
    }
  }, [userLocation]);

  return (
    <div className="flex-1 relative h-screen">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{tx.loading}</p>
          </div>
        </div>
      )}

      {/* Locate button */}
      {isMapLoaded && (
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "absolute top-4 z-20 h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm",
            isRTL ? "right-4" : "left-4"
          )}
          onClick={locateUser}
          disabled={isLocating}
          title={tx.locateMe}
        >
          <Target className={cn("h-5 w-5", isLocating && "animate-pulse")} />
        </Button>
      )}

      {/* Provider Info Card */}
      {selectedProvider && isMapLoaded && (
        <div className={cn(
          "absolute z-30 w-80 top-4",
          isRTL ? "right-16" : "left-16"
        )}>
          <Card className="shadow-xl border-2">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedProvider.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {selectedProvider.specialty || selectedProvider.type}
                  </p>
                  {selectedProvider.verified && (
                    <Badge variant="secondary" className="mt-1">
                      ✅ {tx.verified}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedProvider(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{selectedProvider.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({selectedProvider.reviewsCount})
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{selectedProvider.address}</span>
                </div>
                {userLocation && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Target size={14} />
                    {tx.distance}: {calculateDistance(selectedProvider)} km
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`tel:${selectedProvider.phone}`, '_self')}
                  title={tx.call}
                >
                  <Phone size={14} />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => getDirections(selectedProvider)}
                  title={tx.directions}
                >
                  <Navigation size={14} />
                </Button>
                <Link to={`/provider/${selectedProvider.id}`}>
                  <Button size="sm" className="w-full" title={tx.profile}>
                    <Calendar size={14} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      {isMapLoaded && (
        <div className={cn(
          "absolute bottom-4 z-20",
          isRTL ? "right-4" : "left-4"
        )}>
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-2">{tx.legend}</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#1a73e8] rounded-full" />
                  <span>{tx.verifiedProviders}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#8b5cf6] rounded-full" />
                  <span>{tx.standardProviders}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};