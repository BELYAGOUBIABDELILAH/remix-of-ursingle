import { useEffect, useRef, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapProvider, useMapContext, MapMode } from '@/contexts/MapContext';
import { MapControls } from './MapControls';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createUserLocationMarker } from './MapMarkers';

// Tile layer URLs
const TILE_URLS = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Inner component that uses context
const MapMotherInner = () => {
  const { 
    mapRef, 
    mapContainerRef, 
    center, 
    zoom, 
    setIsReady,
    isFullscreen,
    isRTL,
    geolocation,
    setUserPosition
  } = useMapContext();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const location = useLocation();
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const initRef = useRef(false);
  
  // Determine current mode from path
  const mode: MapMode = useMemo(() => {
    if (location.pathname.includes('/emergency')) return 'emergency';
    if (location.pathname.includes('/blood')) return 'blood';
    return 'providers';
  }, [location.pathname]);
  
  // Translations
  const t = useMemo(() => ({
    fr: {
      title: {
        providers: 'Carte Interactive des Prestataires',
        emergency: 'Services d\'Urgence',
        blood: 'Don de Sang & Centres de Transfusion'
      },
      subtitle: {
        providers: 'Découvrez tous les établissements de santé vérifiés à Sidi Bel Abbès',
        emergency: 'Localisez rapidement les services d\'urgence les plus proches',
        blood: 'Trouvez les hôpitaux et centres de don de sang'
      }
    },
    ar: {
      title: {
        providers: 'خريطة تفاعلية للمقدمين',
        emergency: 'خدمات الطوارئ',
        blood: 'التبرع بالدم ومراكز نقل الدم'
      },
      subtitle: {
        providers: 'اكتشف جميع المؤسسات الصحية الموثقة في سيدي بلعباس',
        emergency: 'حدد بسرعة أقرب خدمات الطوارئ',
        blood: 'ابحث عن المستشفيات ومراكز التبرع بالدم'
      }
    },
    en: {
      title: {
        providers: 'Interactive Provider Map',
        emergency: 'Emergency Services',
        blood: 'Blood Donation & Transfusion Centers'
      },
      subtitle: {
        providers: 'Discover all verified healthcare facilities in Sidi Bel Abbès',
        emergency: 'Quickly locate the nearest emergency services',
        blood: 'Find hospitals and blood donation centers'
      }
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
  // Initialize map ONCE
  useEffect(() => {
    if (initRef.current || !mapContainerRef.current || mapRef.current) return;
    initRef.current = true;
    
    // Create map
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
    });
    
    // Add tile layer
    const tileUrl = theme === 'dark' ? TILE_URLS.dark : TILE_URLS.light;
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    
    // Add zoom control based on RTL
    L.control.zoom({
      position: isRTL ? 'topleft' : 'topright'
    }).addTo(map);
    
    mapRef.current = map;
    setIsReady(true);
    
    // Handle resize
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    
    // NO cleanup - map persists across child route changes
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [center, zoom, isRTL, theme, mapRef, mapContainerRef, setIsReady]);
  
  // Update tile layer when theme changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    
    const newUrl = theme === 'dark' ? TILE_URLS.dark : TILE_URLS.light;
    tileLayerRef.current.setUrl(newUrl);
  }, [theme, mapRef]);
  
  // Note: Zoom control position is set at map init. RTL changes require page reload.
  
  // Invalidate size when fullscreen changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [isFullscreen, mapRef]);
  
  // Add/update user location marker when geolocation changes
  useEffect(() => {
    if (!mapRef.current || !geolocation.latitude || !geolocation.longitude) return;
    
    const userLatLng: L.LatLngExpression = [geolocation.latitude, geolocation.longitude];
    
    // Update context with user position
    setUserPosition({ lat: geolocation.latitude, lng: geolocation.longitude });
    
    if (userMarkerRef.current) {
      // Update existing marker position
      userMarkerRef.current.setLatLng(userLatLng);
    } else {
      // Create new user location marker
      userMarkerRef.current = L.marker(userLatLng, {
        icon: createUserLocationMarker(),
        zIndexOffset: 1000, // Above other markers
      }).addTo(mapRef.current);
      
      userMarkerRef.current.bindPopup('Votre position', {
        closeButton: false,
        className: 'user-location-popup'
      });
    }
    
    return () => {
      // Cleanup on unmount
      if (userMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
    };
  }, [mapRef, geolocation.latitude, geolocation.longitude, setUserPosition]);
  
  return (
    <div className={cn("min-h-screen bg-background flex flex-col", isRTL && "rtl")}>
      <Header />
      
      <main className={cn(
        "flex-1 flex flex-col",
        isFullscreen ? "fixed inset-0 z-50 pt-0" : "container mx-auto px-4 py-6"
      )}>
        {/* Header - hide in fullscreen */}
        {!isFullscreen && (
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">
              {tx.title[mode]}
            </h1>
            <p className="text-muted-foreground">
              {tx.subtitle[mode]}
            </p>
          </div>
        )}
        
        {/* Map container */}
        <div className={cn(
          "relative flex-1 rounded-xl overflow-hidden border border-border shadow-lg",
          isFullscreen && "rounded-none border-0"
        )}>
          {/* Map div */}
          <div 
            ref={mapContainerRef} 
            className="absolute inset-0 z-0"
            style={{ minHeight: isFullscreen ? '100vh' : '500px' }}
          />
          
          {/* Map controls overlay */}
          <MapControls mode={mode} />
          
          {/* Child page content (filters, provider list, selected card) */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Main export wraps with provider
const MapMother = () => {
  return (
    <MapProvider>
      <MapMotherInner />
    </MapProvider>
  );
};

export default MapMother;
