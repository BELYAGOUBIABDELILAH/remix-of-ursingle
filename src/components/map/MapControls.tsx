import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Locate, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon,
  MapPin,
  AlertTriangle,
  Droplet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMapContext, MapMode } from '@/contexts/MapContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface MapControlsProps {
  mode: MapMode;
}

export const MapControls = ({ mode }: MapControlsProps) => {
  const { 
    locateUser, 
    isFullscreen, 
    toggleFullscreen,
    geolocation,
    isRTL
  } = useMapContext();
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const location = useLocation();
  
  const t = useMemo(() => ({
    fr: {
      locate: 'Ma position',
      fullscreen: 'Plein écran',
      exitFullscreen: 'Quitter plein écran',
      theme: 'Changer le thème',
      all: 'Tous',
      emergency: 'Urgences',
      blood: 'Don de sang'
    },
    ar: {
      locate: 'موقعي',
      fullscreen: 'ملء الشاشة',
      exitFullscreen: 'الخروج من ملء الشاشة',
      theme: 'تغيير المظهر',
      all: 'الكل',
      emergency: 'طوارئ',
      blood: 'التبرع بالدم'
    },
    en: {
      locate: 'My location',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      theme: 'Toggle theme',
      all: 'All',
      emergency: 'Emergency',
      blood: 'Blood'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
  return (
    <>
      {/* Mode tabs - top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <Link to="/map/providers">
          <Badge 
            variant={mode === 'providers' ? 'default' : 'outline'} 
            className={cn(
              "cursor-pointer px-3 py-1.5 text-sm",
              mode !== 'providers' && "bg-background/80 backdrop-blur-sm hover:bg-background"
            )}
          >
            <MapPin className="h-3.5 w-3.5 mr-1.5" /> 
            {tx.all}
          </Badge>
        </Link>
        <Link to="/map/emergency">
          <Badge 
            variant={mode === 'emergency' ? 'default' : 'outline'} 
            className={cn(
              "cursor-pointer px-3 py-1.5 text-sm",
              mode === 'emergency' 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-background/80 backdrop-blur-sm hover:bg-background"
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> 
            {tx.emergency}
          </Badge>
        </Link>
        <Link to="/map/blood">
          <Badge 
            variant={mode === 'blood' ? 'default' : 'outline'} 
            className={cn(
              "cursor-pointer px-3 py-1.5 text-sm",
              mode === 'blood' 
                ? "bg-rose-600 text-white" 
                : "bg-background/80 backdrop-blur-sm hover:bg-background"
            )}
          >
            <Droplet className="h-3.5 w-3.5 mr-1.5" /> 
            {tx.blood}
          </Badge>
        </Link>
      </div>
      
      {/* Control buttons - bottom right (or left for RTL) */}
      <div className={cn(
        "absolute bottom-4 z-10 flex flex-col gap-2",
        isRTL ? "left-4" : "right-4"
      )}>
        {/* Locate button */}
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
          onClick={locateUser}
          disabled={geolocation.loading}
          title={tx.locate}
        >
          <Locate className={cn("h-5 w-5", geolocation.loading && "animate-pulse")} />
        </Button>
        
        {/* Theme toggle */}
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
          onClick={toggleTheme}
          title={tx.theme}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        {/* Fullscreen toggle */}
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
          onClick={toggleFullscreen}
          title={isFullscreen ? tx.exitFullscreen : tx.fullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>
    </>
  );
};
