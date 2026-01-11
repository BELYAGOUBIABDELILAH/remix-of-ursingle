import { useEffect, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMapContext } from '@/contexts/MapContext';
import { useBloodCenters } from '@/hooks/useProviders';
import { ProviderCard } from '../ProviderCard';
import { ProviderList } from '../ProviderList';
import { createMarkerIcon } from '../MapMarkers';
import { CityHealthProvider } from '@/data/providers';
import { useLanguage } from '@/contexts/LanguageContext';

const BloodMapChild = () => {
  const { mapRef, isReady, registerMarkerLayer, removeMarkerLayer, selectedProvider, setSelectedProvider, flyTo, geolocation } = useMapContext();
  const { language } = useLanguage();
  const { data: providers = [], isLoading } = useBloodCenters();
  
  const disclaimer = {
    fr: 'La disponibilité du sang dépend du stock réel. Pour les urgences vitales, contactez le 15.',
    ar: 'يعتمد توفر الدم على المخزون الفعلي. للطوارئ، اتصل بـ 15.',
    en: 'Blood availability depends on real stock. For emergencies, call 15.'
  };
  
  const distances = useMemo(() => {
    const map = new Map<string, number>();
    providers.forEach(p => {
      const dist = geolocation.getDistanceFromUser(p.lat, p.lng);
      if (dist !== null) map.set(p.id, dist);
    });
    return map;
  }, [providers, geolocation]);
  
  const sortedProviders = useMemo(() => [...providers].sort((a, b) => (distances.get(a.id) ?? 999) - (distances.get(b.id) ?? 999)), [providers, distances]);
  
  const handleProviderClick = useCallback((provider: CityHealthProvider) => {
    setSelectedProvider(provider);
    flyTo(provider.lat, provider.lng, 16);
  }, [setSelectedProvider, flyTo]);
  
  useEffect(() => {
    if (!isReady || !mapRef.current || providers.length === 0) return;
    
    const markerGroup = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 40 });
    
    providers.forEach(provider => {
      const marker = L.marker([provider.lat, provider.lng], {
        icon: createMarkerIcon(provider.type, selectedProvider?.id === provider.id, false)
      });
      marker.on('click', () => handleProviderClick(provider));
      markerGroup.addLayer(marker);
    });
    
    registerMarkerLayer('blood', markerGroup);
    return () => removeMarkerLayer('blood');
  }, [isReady, mapRef, providers, selectedProvider?.id, registerMarkerLayer, removeMarkerLayer, handleProviderClick]);
  
  return (
    <>
      <Alert variant="destructive" className="absolute top-16 left-4 right-4 z-10 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-lg bg-rose-500/10 border-rose-500/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{disclaimer[language as keyof typeof disclaimer] || disclaimer.fr}</AlertDescription>
      </Alert>
      
      <ProviderList providers={sortedProviders} loading={isLoading} distances={distances} onProviderClick={handleProviderClick} />
      {selectedProvider && <ProviderCard provider={selectedProvider} distance={distances.get(selectedProvider.id)} onClose={() => setSelectedProvider(null)} />}
    </>
  );
};

export default BloodMapChild;
