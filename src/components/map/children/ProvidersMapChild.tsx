import { useEffect, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMapContext } from '@/contexts/MapContext';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { ProviderCard } from '../ProviderCard';
import { ProviderList } from '../ProviderList';
import { createMarkerIcon } from '../MapMarkers';
import { CityHealthProvider } from '@/data/providers';

const ProvidersMapChild = () => {
  const { 
    mapRef, 
    isReady, 
    registerMarkerLayer, 
    removeMarkerLayer,
    selectedProvider,
    setSelectedProvider,
    flyTo,
    geolocation
  } = useMapContext();
  
  const { data: providers = [], isLoading } = useVerifiedProviders();
  
  // Calculate distances
  const distances = useMemo(() => {
    const map = new Map<string, number>();
    providers.forEach(p => {
      const dist = geolocation.getDistanceFromUser(p.lat, p.lng);
      if (dist !== null) map.set(p.id, dist);
    });
    return map;
  }, [providers, geolocation]);
  
  // Sort by distance
  const sortedProviders = useMemo(() => {
    return [...providers].sort((a, b) => {
      const distA = distances.get(a.id) ?? 999;
      const distB = distances.get(b.id) ?? 999;
      return distA - distB;
    });
  }, [providers, distances]);
  
  // Handle provider click
  const handleProviderClick = useCallback((provider: CityHealthProvider) => {
    setSelectedProvider(provider);
    flyTo(provider.lat, provider.lng, 16);
  }, [setSelectedProvider, flyTo]);
  
  // Register markers
  useEffect(() => {
    if (!isReady || !mapRef.current || providers.length === 0) return;
    
    const markerGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });
    
    providers.forEach(provider => {
      const isSelected = selectedProvider?.id === provider.id;
      const marker = L.marker([provider.lat, provider.lng], {
        icon: createMarkerIcon(provider.type, isSelected, provider.emergency)
      });
      
      marker.on('click', () => handleProviderClick(provider));
      markerGroup.addLayer(marker);
    });
    
    registerMarkerLayer('providers', markerGroup);
    
    return () => {
      removeMarkerLayer('providers');
    };
  }, [isReady, mapRef, providers, selectedProvider?.id, registerMarkerLayer, removeMarkerLayer, handleProviderClick]);
  
  return (
    <>
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
