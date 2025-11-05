import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Star, Navigation, Calendar, Loader2, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Provider } from '@/pages/SearchPage';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SearchMapProps {
  providers: Provider[];
}

export const SearchMap = ({ providers }: SearchMapProps) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(true);

  // Check for Mapbox token in environment or prompt user
  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setMapboxToken(storedToken);
      setShowTokenInput(false);
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || isMapLoaded) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      // Center on Sidi Bel Abbès
      const map_instance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-0.6300, 35.1975], // Sidi Bel Abbès coordinates
        zoom: 12,
      });

      // Add navigation controls
      map_instance.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map_instance.addControl(geolocateControl, 'top-right');

      // Listen for user location
      geolocateControl.on('geolocate', (e: any) => {
        setUserLocation([e.coords.longitude, e.coords.latitude]);
      });

      map.current = map_instance;
      setIsMapLoaded(true);

      return () => {
        map_instance.remove();
        setIsMapLoaded(false);
      };
    } catch (error) {
      toast({
        title: "Erreur Mapbox",
        description: "Clé API invalide. Veuillez vérifier votre token.",
        variant: "destructive",
      });
      setShowTokenInput(true);
    }
  }, [mapboxToken, toast]);

  // Add markers for providers
  useEffect(() => {
    if (!map.current || !isMapLoaded || providers.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create markers with clustering
    providers.forEach((provider) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = provider.verified ? '#1a73e8' : '#8b5cf6';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${provider.name}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${provider.specialty || provider.type}</p>
          <p style="font-size: 12px; margin-bottom: 4px;">⭐ ${provider.rating} (${provider.reviewsCount})</p>
          <p style="font-size: 12px; color: #666;">${provider.address}</p>
        </div>
      `);

      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([provider.lng, provider.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Click handler
      el.addEventListener('click', () => {
        setSelectedProvider(provider);
        map.current?.flyTo({
          center: [provider.lng, provider.lat],
          zoom: 15,
          duration: 1000,
        });
      });

      markersRef.current.push(marker);
    });
  }, [providers, isMapLoaded]);

  // Get directions to provider
  const getDirections = (provider: Provider) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[1]},${userLocation[0]}&destination=${provider.lat},${provider.lng}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "Position non disponible",
        description: "Activez la géolocalisation pour obtenir des directions.",
      });
    }
  };

  // Calculate distance from user location
  const calculateDistance = (provider: Provider): number | null => {
    if (!userLocation) return null;
    
    const R = 6371; // Earth radius in km
    const dLat = (provider.lat - userLocation[1]) * Math.PI / 180;
    const dLon = (provider.lng - userLocation[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation[1] * Math.PI / 180) * Math.cos(provider.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setShowTokenInput(false);
      toast({
        title: "Token enregistré",
        description: "La carte va maintenant se charger.",
      });
    }
  };

  return (
    <div className="flex-1 relative">
      {/* Mapbox Token Input */}
      {showTokenInput && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Configuration Mapbox</CardTitle>
              <CardDescription>
                Entrez votre clé API Mapbox pour activer la carte interactive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="token">Token Mapbox Public</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="pk.eyJ1Ijo..."
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Obtenez votre token sur{' '}
                    <a 
                      href="https://mapbox.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      mapbox.com
                    </a>
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Activer la carte
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Container */}
      <div className="h-screen relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {!isMapLoaded && !showTokenInput && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
            </div>
          </div>
        )}

        {/* Provider Info Card */}
        {selectedProvider && isMapLoaded && (
          <div 
            className="absolute z-30 w-80 top-4 left-4"
          >
            <Card className="shadow-xl border-2">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedProvider.name}</h3>
                    <p className="text-muted-foreground text-sm">{selectedProvider.specialty || selectedProvider.type}</p>
                    {selectedProvider.verified && (
                      <Badge variant="secondary" className="mt-1">
                        ✅ Vérifié
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="text-muted-foreground hover:text-foreground ml-2"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{selectedProvider.rating}</span>
                  <span className="text-xs text-muted-foreground">({selectedProvider.reviewsCount})</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="mt-0.5 text-muted-foreground" />
                    <span>{selectedProvider.address}</span>
                  </div>
                  {userLocation && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Target size={14} />
                      Distance: {calculateDistance(selectedProvider)}km
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`tel:${selectedProvider.phone}`, '_self')}
                    title="Appeler"
                  >
                    <Phone size={14} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => getDirections(selectedProvider)}
                    title="Itinéraire"
                  >
                    <Navigation size={14} />
                  </Button>
                  <Link to={`/provider/${selectedProvider.id}`}>
                    <Button size="sm" className="w-full" title="Voir profil">
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
          <div className="absolute bottom-4 left-4 z-20">
            <Card className="shadow-lg">
              <CardContent className="p-3">
                <h4 className="font-medium text-sm mb-2">Légende</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#1a73e8] rounded-full"></div>
                    <span>Professionnels vérifiés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#8b5cf6] rounded-full"></div>
                    <span>Professionnels standards</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};