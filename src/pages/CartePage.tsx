import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, AlertTriangle, Droplet, Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CityHealthMap, MapMode } from '@/components/map/CityHealthMap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function CartePage() {
  const [searchParams] = useSearchParams();
  const { isRTL, language } = useLanguage();
  
  const mode = (searchParams.get('mode') as MapMode) || 'all';
  
  const t = useMemo(() => ({
    fr: {
      title: {
        all: 'Carte Interactive des Prestataires',
        emergency: 'Services d\'Urgence',
        blood: 'Don de Sang & Centres de Transfusion'
      },
      subtitle: {
        all: 'Découvrez tous les établissements de santé vérifiés à Sidi Bel Abbès',
        emergency: 'Localisez rapidement les services d\'urgence les plus proches',
        blood: 'Trouvez les hôpitaux et centres de don de sang'
      },
      disclaimer: {
        emergency: 'Pour les urgences vitales, appelez immédiatement le 15 (SAMU) ou le 14.',
        blood: 'La disponibilité du sang dépend du stock réel. Pour les urgences vitales, contactez le 15.'
      },
      tabs: {
        all: 'Tous',
        emergency: 'Urgences',
        blood: 'Don de sang'
      }
    },
    ar: {
      title: {
        all: 'خريطة تفاعلية للمقدمين',
        emergency: 'خدمات الطوارئ',
        blood: 'التبرع بالدم ومراكز نقل الدم'
      },
      subtitle: {
        all: 'اكتشف جميع المؤسسات الصحية الموثقة في سيدي بلعباس',
        emergency: 'حدد بسرعة أقرب خدمات الطوارئ',
        blood: 'ابحث عن المستشفيات ومراكز التبرع بالدم'
      },
      disclaimer: {
        emergency: 'للحالات الطارئة، اتصل فوراً بـ 15 (سامو) أو 14.',
        blood: 'يعتمد توفر الدم على المخزون الفعلي. للطوارئ، اتصل بـ 15.'
      },
      tabs: {
        all: 'الكل',
        emergency: 'طوارئ',
        blood: 'التبرع بالدم'
      }
    },
    en: {
      title: {
        all: 'Interactive Provider Map',
        emergency: 'Emergency Services',
        blood: 'Blood Donation & Transfusion Centers'
      },
      subtitle: {
        all: 'Discover all verified healthcare facilities in Sidi Bel Abbès',
        emergency: 'Quickly locate the nearest emergency services',
        blood: 'Find hospitals and blood donation centers'
      },
      disclaimer: {
        emergency: 'For life-threatening emergencies, immediately call 15 (SAMU) or 14.',
        blood: 'Blood availability depends on real stock. For emergencies, call 15.'
      },
      tabs: {
        all: 'All',
        emergency: 'Emergency',
        blood: 'Blood'
      }
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
  const modeIcon = {
    all: <MapPin className="h-6 w-6" />,
    emergency: <AlertTriangle className="h-6 w-6" />,
    blood: <Droplet className="h-6 w-6" />
  };
  
  const modeColor = {
    all: 'from-primary to-accent',
    emergency: 'from-destructive to-orange-500',
    blood: 'from-rose-600 to-pink-500'
  };

  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white", modeColor[mode])}>
              {modeIcon[mode]}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {tx.title[mode]}
              </h1>
              <p className="text-muted-foreground">
                {tx.subtitle[mode]}
              </p>
            </div>
          </div>
          
          {/* Mode badges */}
          <div className="flex gap-2 mt-4">
            <Link to="/carte">
              <Badge variant={mode === 'all' ? 'default' : 'outline'} className="cursor-pointer">
                <Search className="h-3 w-3 mr-1" /> {tx.tabs.all}
              </Badge>
            </Link>
            <Link to="/carte?mode=emergency">
              <Badge variant={mode === 'emergency' ? 'default' : 'outline'} className="cursor-pointer">
                <AlertTriangle className="h-3 w-3 mr-1" /> {tx.tabs.emergency}
              </Badge>
            </Link>
            <Link to="/carte?mode=blood">
              <Badge variant={mode === 'blood' ? 'default' : 'outline'} className="cursor-pointer">
                <Droplet className="h-3 w-3 mr-1" /> {tx.tabs.blood}
              </Badge>
            </Link>
          </div>
        </div>
        
        {/* Emergency Disclaimer */}
        {(mode === 'emergency' || mode === 'blood') && (
          <Alert variant="destructive" className="mb-6 bg-destructive/5 border-destructive/30">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              {tx.disclaimer[mode]}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Map Component */}
        <CityHealthMap mode={mode} showFilters={true} showProviderList={true} />
      </main>
    </div>
  );
}
