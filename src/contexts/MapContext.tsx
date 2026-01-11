import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import L from 'leaflet';
import { CityHealthProvider } from '@/data/providers';
import { useGeolocation, SIDI_BEL_ABBES_CENTER } from '@/hooks/useGeolocation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export type MapMode = 'providers' | 'emergency' | 'blood';

interface MapContextType {
  // Map instance
  mapRef: React.MutableRefObject<L.Map | null>;
  mapContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
  
  // Map state
  center: [number, number];
  zoom: number;
  
  // Theme & RTL
  theme: 'light' | 'dark';
  isRTL: boolean;
  
  // Selected provider
  selectedProvider: CityHealthProvider | null;
  setSelectedProvider: (provider: CityHealthProvider | null) => void;
  
  // Marker layers registry
  markerLayers: Map<string, L.MarkerClusterGroup>;
  registerMarkerLayer: (layerId: string, layer: L.MarkerClusterGroup) => void;
  removeMarkerLayer: (layerId: string) => void;
  
  // Map controls
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  fitBounds: (bounds: L.LatLngBounds, options?: L.FitBoundsOptions) => void;
  getDirections: (provider: CityHealthProvider) => void;
  locateUser: () => void;
  
  // Geolocation
  geolocation: ReturnType<typeof useGeolocation>;
  
  // Fullscreen
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CityHealthProvider | null>(null);
  const [markerLayers] = useState(() => new Map<string, L.MarkerClusterGroup>());
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { theme } = useTheme();
  const { isRTL } = useLanguage();
  const geolocation = useGeolocation({ enableHighAccuracy: true });
  
  const center: [number, number] = [SIDI_BEL_ABBES_CENTER.lat, SIDI_BEL_ABBES_CENTER.lng];
  const zoom = 13;
  
  const registerMarkerLayer = useCallback((layerId: string, layer: L.MarkerClusterGroup) => {
    // Remove existing layer with same ID first
    if (markerLayers.has(layerId) && mapRef.current) {
      const existingLayer = markerLayers.get(layerId)!;
      mapRef.current.removeLayer(existingLayer);
    }
    
    markerLayers.set(layerId, layer);
    
    if (mapRef.current) {
      mapRef.current.addLayer(layer);
    }
  }, [markerLayers]);
  
  const removeMarkerLayer = useCallback((layerId: string) => {
    if (markerLayers.has(layerId) && mapRef.current) {
      const layer = markerLayers.get(layerId)!;
      mapRef.current.removeLayer(layer);
      markerLayers.delete(layerId);
    }
  }, [markerLayers]);
  
  const flyTo = useCallback((lat: number, lng: number, zoomLevel: number = 16) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoomLevel, {
        duration: 0.5
      });
    }
  }, []);
  
  const fitBounds = useCallback((bounds: L.LatLngBounds, options?: L.FitBoundsOptions) => {
    if (mapRef.current) {
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        ...options
      });
    }
  }, []);
  
  const getDirections = useCallback((provider: CityHealthProvider) => {
    if (provider.lat && provider.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`;
      window.open(url, '_blank');
    }
  }, []);
  
  const locateUser = useCallback(() => {
    geolocation.getCurrentPosition();
    
    // Watch for position update
    const checkPosition = setInterval(() => {
      if (geolocation.latitude && geolocation.longitude && mapRef.current) {
        mapRef.current.flyTo([geolocation.latitude, geolocation.longitude], 15, {
          duration: 0.5
        });
        clearInterval(checkPosition);
      }
    }, 100);
    
    // Clear after 5 seconds if no position
    setTimeout(() => clearInterval(checkPosition), 5000);
  }, [geolocation]);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    
    // Trigger map resize after state change
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
  }, []);
  
  return (
    <MapContext.Provider value={{
      mapRef,
      mapContainerRef,
      isReady,
      setIsReady,
      center,
      zoom,
      theme,
      isRTL,
      selectedProvider,
      setSelectedProvider,
      markerLayers,
      registerMarkerLayer,
      removeMarkerLayer,
      flyTo,
      fitBounds,
      getDirections,
      locateUser,
      geolocation,
      isFullscreen,
      toggleFullscreen,
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};
