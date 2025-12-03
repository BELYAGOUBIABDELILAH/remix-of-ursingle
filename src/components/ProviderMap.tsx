import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ProviderMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
  height?: string;
}

const ProviderMap = ({ lat, lng, name, address, height = "h-56" }: ProviderMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add marker
    const marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
    marker.bindPopup(`<strong>${name}</strong><br/>${address}`);

    mapInstanceRef.current = map;
    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, name, address]);

  // Update map view when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, [lat, lng]);

  return (
    <div className={`${height} rounded-lg overflow-hidden relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <MapPin className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Chargement...</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default ProviderMap;
