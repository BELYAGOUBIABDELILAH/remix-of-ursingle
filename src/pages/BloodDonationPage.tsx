import { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { 
  Droplet, 
  Search, 
  Hospital, 
  Clock, 
  MapPin, 
  Phone, 
  AlertTriangle,
  Heart,
  Calendar,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  Info,
  Maximize2,
  LocateFixed,
  Filter,
  ChevronDown,
  Star,
  Shield,
  Users
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getProviders, CityHealthProvider } from '@/data/providers';
import { cn } from '@/lib/utils';

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] as const;

type BloodType = typeof BLOOD_TYPES[number];

interface BloodProfile {
  bloodType?: BloodType;
  lastDonationDate?: string;
  reminderEnabled: boolean;
}

// Custom marker icons
const createMarkerIcon = (type: 'hospital' | 'blood_center', isActive: boolean = false) => {
  const color = type === 'hospital' ? '#dc2626' : '#7c3aed';
  const activeColor = isActive ? '#22c55e' : color;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${activeColor};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      ">
        ${type === 'hospital' 
          ? '<span style="font-size: 14px;">🏥</span>'
          : '<span style="font-size: 14px;">🩸</span>'
        }
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

export default function BloodDonationPage() {
  const { isRTL, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const geolocation = useGeolocation();
  
  // State
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | ''>('');
  const [providers, setProviders] = useState<CityHealthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterHasBloodBank, setFilterHasBloodBank] = useState(false);
  const [filterDonationAvailable, setFilterDonationAvailable] = useState(false);
  
  // Eligibility checker
  const [eligibilityAge, setEligibilityAge] = useState('');
  const [eligibilityWeight, setEligibilityWeight] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<'eligible' | 'not_yet' | null>(null);
  const [nextEligibleDate, setNextEligibleDate] = useState<string | null>(null);
  
  // Blood profile (for authenticated users)
  const [bloodProfile, setBloodProfile] = useState<BloodProfile>({
    reminderEnabled: false
  });
  
  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  
  const SBA_CENTER: L.LatLngExpression = [35.1975, -0.6300];
  
  // Translations
  const texts = {
    fr: {
      title: 'Don de Sang & Recherche d\'Urgence',
      subtitle: 'Trouvez rapidement les hôpitaux et centres de don de sang à Sidi Bel Abbès',
      emergencyFinder: 'Recherche d\'Urgence',
      donateBlood: 'Donner du Sang',
      reminders: 'Rappels',
      directory: 'Annuaire',
      selectBloodType: 'Sélectionnez votre groupe sanguin',
      searchResults: 'Résultats de recherche',
      noResults: 'Aucun établissement trouvé',
      openNow: 'Ouvert maintenant',
      hasBloodBank: 'Banque de sang',
      donationAvailable: 'Don disponible',
      filters: 'Filtres',
      disclaimer: 'La disponibilité du sang dépend du stock en temps réel des hôpitaux. Pour les urgences vitales, contactez immédiatement les services d\'urgence.',
      emergencyCall: 'Appelez le 15 pour les urgences',
      eligibilityChecker: 'Vérificateur d\'éligibilité',
      age: 'Âge',
      weight: 'Poids (kg)',
      lastDonationDate: 'Date du dernier don',
      checkEligibility: 'Vérifier mon éligibilité',
      eligible: 'Vous êtes éligible au don de sang !',
      notYetEligible: 'Vous ne pouvez pas encore donner',
      nextEligible: 'Prochaine date éligible',
      eligibilityNote: 'Ceci est une estimation. L\'approbation finale dépend du personnel médical.',
      findCenter: 'Trouver un centre près de moi',
      bloodType: 'Groupe sanguin',
      saveProfile: 'Sauvegarder mon profil sanguin',
      enableReminders: 'Activer les rappels de don',
      reminderInfo: 'Recevez une notification tous les 3 mois',
      loginRequired: 'Connectez-vous pour sauvegarder vos préférences',
      bloodBank: 'Banque de sang',
      donationCenter: 'Centre de don',
      verified: 'Vérifié',
      call: 'Appeler',
      getDirections: 'Itinéraire',
      distance: 'Distance',
      locateMe: 'Me localiser',
      hospital: 'Hôpital',
      bloodCenter: 'Centre de sang',
    },
    ar: {
      title: 'التبرع بالدم والبحث الطارئ',
      subtitle: 'ابحث بسرعة عن المستشفيات ومراكز التبرع بالدم في سيدي بلعباس',
      emergencyFinder: 'البحث الطارئ',
      donateBlood: 'تبرع بالدم',
      reminders: 'التذكيرات',
      directory: 'الدليل',
      selectBloodType: 'اختر فصيلة دمك',
      searchResults: 'نتائج البحث',
      noResults: 'لم يتم العثور على مؤسسات',
      openNow: 'مفتوح الآن',
      hasBloodBank: 'بنك الدم',
      donationAvailable: 'التبرع متاح',
      filters: 'المرشحات',
      disclaimer: 'يعتمد توفر الدم على المخزون الفعلي للمستشفيات. للحالات الطارئة، اتصل فوراً بخدمات الطوارئ.',
      emergencyCall: 'اتصل بـ 15 للطوارئ',
      eligibilityChecker: 'فحص الأهلية',
      age: 'العمر',
      weight: 'الوزن (كجم)',
      lastDonationDate: 'تاريخ آخر تبرع',
      checkEligibility: 'تحقق من أهليتي',
      eligible: 'أنت مؤهل للتبرع بالدم!',
      notYetEligible: 'لا يمكنك التبرع بعد',
      nextEligible: 'التاريخ المؤهل التالي',
      eligibilityNote: 'هذا تقدير. الموافقة النهائية تعتمد على الطاقم الطبي.',
      findCenter: 'ابحث عن مركز بالقرب مني',
      bloodType: 'فصيلة الدم',
      saveProfile: 'حفظ ملف الدم الخاص بي',
      enableReminders: 'تفعيل تذكيرات التبرع',
      reminderInfo: 'تلقي إشعار كل 3 أشهر',
      loginRequired: 'سجل الدخول لحفظ تفضيلاتك',
      bloodBank: 'بنك الدم',
      donationCenter: 'مركز التبرع',
      verified: 'موثق',
      call: 'اتصل',
      getDirections: 'الاتجاهات',
      distance: 'المسافة',
      locateMe: 'حدد موقعي',
      hospital: 'مستشفى',
      bloodCenter: 'مركز الدم',
    },
    en: {
      title: 'Blood Donation & Emergency Finder',
      subtitle: 'Quickly find hospitals and blood donation centers in Sidi Bel Abbès',
      emergencyFinder: 'Emergency Finder',
      donateBlood: 'Donate Blood',
      reminders: 'Reminders',
      directory: 'Directory',
      selectBloodType: 'Select your blood type',
      searchResults: 'Search Results',
      noResults: 'No facilities found',
      openNow: 'Open now',
      hasBloodBank: 'Blood bank',
      donationAvailable: 'Donation available',
      filters: 'Filters',
      disclaimer: 'Blood availability depends on real-time hospital stock. For life-threatening emergencies, contact emergency services immediately.',
      emergencyCall: 'Call 15 for emergencies',
      eligibilityChecker: 'Eligibility Checker',
      age: 'Age',
      weight: 'Weight (kg)',
      lastDonationDate: 'Last donation date',
      checkEligibility: 'Check my eligibility',
      eligible: 'You are eligible to donate blood!',
      notYetEligible: 'You cannot donate yet',
      nextEligible: 'Next eligible date',
      eligibilityNote: 'This is guidance only, not medical approval.',
      findCenter: 'Find a center near me',
      bloodType: 'Blood type',
      saveProfile: 'Save my blood profile',
      enableReminders: 'Enable donation reminders',
      reminderInfo: 'Receive a notification every 3 months',
      loginRequired: 'Log in to save your preferences',
      bloodBank: 'Blood Bank',
      donationCenter: 'Donation Center',
      verified: 'Verified',
      call: 'Call',
      getDirections: 'Directions',
      distance: 'Distance',
      locateMe: 'Locate me',
      hospital: 'Hospital',
      bloodCenter: 'Blood Center',
    }
  };
  
  const tx = texts[language] || texts.fr;
  
  // Load providers
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const allProviders = getProviders();
      const bloodProviders = allProviders.filter(p => 
        p.verificationStatus === 'verified' && 
        p.isPublic &&
        (p.type === 'hospital' || p.type === 'blood_cabin' || p.emergency)
      );
      setProviders(bloodProviders);
      setLoading(false);
    }, 500);
  }, []);
  
  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (filterOpenNow && !p.isOpen) return false;
      if (filterHasBloodBank && p.type !== 'hospital') return false;
      if (filterDonationAvailable && p.type !== 'blood_cabin') return false;
      return true;
    }).map(p => ({
      ...p,
      distanceFromUser: geolocation.getDistanceFromUser(p.lat, p.lng)
    })).sort((a, b) => (a.distanceFromUser || 0) - (b.distanceFromUser || 0));
  }, [providers, filterOpenNow, filterHasBloodBank, filterDonationAvailable, geolocation]);
  
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
        icon: createMarkerIcon(
          provider.type === 'hospital' ? 'hospital' : 'blood_center',
          selectedProvider === provider.id
        )
      });

      marker.bindTooltip(provider.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -36]
      });

      marker.bindPopup(`
        <div style="min-width: 200px; padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">${provider.name}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 4px;">📍 ${provider.address}</p>
          <p style="font-size: 12px; margin-bottom: 8px;">📞 <a href="tel:${provider.phone}" style="color: #3b82f6;">${provider.phone}</a></p>
          ${provider.isOpen ? '<span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px;">✓ Ouvert</span>' : ''}
        </div>
      `);

      marker.on('click', () => {
        setSelectedProvider(provider.id);
      });

      markersRef.current?.addLayer(marker);
    });
  }, [filteredProviders, selectedProvider]);
  
  // Handle locate me
  const handleLocateMe = () => {
    geolocation.getCurrentPosition();
    if (geolocation.hasLocation && mapRef.current) {
      mapRef.current.flyTo([geolocation.latitude!, geolocation.longitude!], 15, { duration: 0.5 });
    }
  };
  
  // Handle card click
  const handleCardClick = (provider: CityHealthProvider) => {
    setSelectedProvider(provider.id);
    if (mapRef.current) {
      mapRef.current.flyTo([provider.lat, provider.lng], 16, { duration: 0.5 });
    }
  };
  
  // Check eligibility
  const checkEligibility = () => {
    const age = parseInt(eligibilityAge);
    const weight = parseInt(eligibilityWeight);
    
    if (age < 18 || weight < 50) {
      setEligibilityResult('not_yet');
      setNextEligibleDate(null);
      return;
    }
    
    if (lastDonation) {
      const lastDate = new Date(lastDonation);
      const minWait = 56;
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + minWait);
      
      if (nextDate > new Date()) {
        setEligibilityResult('not_yet');
        setNextEligibleDate(nextDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR'));
        return;
      }
    }
    
    setEligibilityResult('eligible');
    setNextEligibleDate(null);
  };
  
  // Save blood profile
  const saveBloodProfile = () => {
    localStorage.setItem('blood_profile', JSON.stringify(bloodProfile));
  };
  
  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full mb-4">
            <Droplet className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">{tx.emergencyCall}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
            {tx.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {tx.subtitle}
          </p>
        </div>
        
        {/* Emergency Disclaimer */}
        <Alert variant="destructive" className="mb-8 border-destructive/50 bg-destructive/5">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>{tx.emergencyCall}</AlertTitle>
          <AlertDescription>{tx.disclaimer}</AlertDescription>
        </Alert>
        
        {/* Main Tabs */}
        <Tabs defaultValue="emergency" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
            <TabsTrigger value="emergency" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Search className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.emergencyFinder}</span>
            </TabsTrigger>
            <TabsTrigger value="donate" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Heart className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.donateBlood}</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.reminders}</span>
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Hospital className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.directory}</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Emergency Blood Finder */}
          <TabsContent value="emergency" className="space-y-6">
            {/* Blood Type Selector */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-destructive" />
                  {tx.selectBloodType}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={selectedBloodType === type ? "default" : "outline"}
                      className={cn(
                        "min-w-[60px] font-bold",
                        selectedBloodType === type && "bg-destructive hover:bg-destructive/90"
                      )}
                      onClick={() => setSelectedBloodType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Map + List Layout */}
            <div className={cn(
              "grid gap-6",
              isFullscreen ? "grid-cols-1" : "lg:grid-cols-2"
            )}>
              {/* Map */}
              <Card className={cn(
                "glass-card overflow-hidden",
                isFullscreen && "fixed inset-4 z-50"
              )}>
                <div className="relative">
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-background/90 backdrop-blur-sm shadow-lg"
                      onClick={handleLocateMe}
                      disabled={geolocation.loading}
                    >
                      <LocateFixed className={cn("h-4 w-4", geolocation.loading && "animate-pulse")} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-background/90 backdrop-blur-sm shadow-lg"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Filter Toggle */}
                  <div className="absolute top-4 left-4 z-[1000]">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-background/90 backdrop-blur-sm shadow-lg"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {tx.filters}
                      <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", showFilters && "rotate-180")} />
                    </Button>
                    
                    {showFilters && (
                      <div className="mt-2 p-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">{tx.openNow}</Label>
                          <Switch checked={filterOpenNow} onCheckedChange={setFilterOpenNow} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">{tx.hasBloodBank}</Label>
                          <Switch checked={filterHasBloodBank} onCheckedChange={setFilterHasBloodBank} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">{tx.donationAvailable}</Label>
                          <Switch checked={filterDonationAvailable} onCheckedChange={setFilterDonationAvailable} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Map Container */}
                  <div
                    ref={mapContainerRef}
                    className={cn(
                      "w-full",
                      isFullscreen ? "h-[calc(100vh-120px)]" : "h-[400px] lg:h-[500px]"
                    )}
                  >
                    {loading && (
                      <div className="h-full flex items-center justify-center bg-muted">
                        <div className="text-center space-y-2">
                          <Droplet className="h-12 w-12 text-destructive animate-pulse mx-auto" />
                          <p className="text-muted-foreground">Chargement...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="p-4 border-t border-border flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-destructive" />
                    <span>{tx.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-600" />
                    <span>{tx.bloodCenter}</span>
                  </div>
                </div>
              </Card>
              
              {/* Provider List */}
              {!isFullscreen && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>{tx.searchResults}</CardTitle>
                    <CardDescription>
                      {filteredProviders.length} {language === 'ar' ? 'مؤسسة' : 'établissements'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[500px] overflow-y-auto space-y-4">
                    {loading ? (
                      Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))
                    ) : filteredProviders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{tx.noResults}</p>
                      </div>
                    ) : (
                      filteredProviders.map((provider) => (
                        <div
                          key={provider.id}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                            selectedProvider === provider.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => handleCardClick(provider)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{provider.name}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {provider.address}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {provider.verified && (
                                <Badge variant="outline" className="text-primary border-primary">
                                  <Shield className="h-3 w-3 mr-1" />
                                  {tx.verified}
                                </Badge>
                              )}
                              {provider.isOpen && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {tx.openNow}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {provider.type === 'hospital' && (
                              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                                <Hospital className="h-3 w-3 mr-1" />
                                {tx.bloodBank}
                              </Badge>
                            )}
                            {provider.type === 'blood_cabin' && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                                <Droplet className="h-3 w-3 mr-1" />
                                {tx.donationCenter}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                {provider.rating}
                              </span>
                              {provider.distanceFromUser && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {provider.distanceFromUser.toFixed(1)} km
                                </span>
                              )}
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${provider.phone}`}>
                                <Phone className="h-4 w-4 mr-2" />
                                {tx.call}
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Tab 2: Donate Blood */}
          <TabsContent value="donate" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Eligibility Checker */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {tx.eligibilityChecker}
                  </CardTitle>
                  <CardDescription>
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{tx.eligibilityNote}</AlertDescription>
                    </Alert>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">{tx.age}</Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="100"
                        value={eligibilityAge}
                        onChange={(e) => setEligibilityAge(e.target.value)}
                        placeholder="≥ 18"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">{tx.weight}</Label>
                      <Input
                        id="weight"
                        type="number"
                        min="1"
                        max="300"
                        value={eligibilityWeight}
                        onChange={(e) => setEligibilityWeight(e.target.value)}
                        placeholder="≥ 50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastDonation">{tx.lastDonationDate}</Label>
                    <Input
                      id="lastDonation"
                      type="date"
                      value={lastDonation}
                      onChange={(e) => setLastDonation(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={checkEligibility} className="w-full">
                    {tx.checkEligibility}
                  </Button>
                  
                  {eligibilityResult && (
                    <div className={cn(
                      "p-4 rounded-lg border",
                      eligibilityResult === 'eligible'
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                        : "bg-amber-50 border-amber-200 dark:bg-amber-900/20"
                    )}>
                      <div className="flex items-center gap-2">
                        {eligibilityResult === 'eligible' ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-300">
                              {tx.eligible}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-amber-600" />
                            <span className="font-medium text-amber-700 dark:text-amber-300">
                              {tx.notYetEligible}
                            </span>
                          </>
                        )}
                      </div>
                      {nextEligibleDate && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {tx.nextEligible}: <strong>{nextEligibleDate}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Blood Facts */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-destructive" />
                    {language === 'ar' ? 'لماذا التبرع بالدم؟' : 'Pourquoi donner son sang ?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {[
                      { icon: Users, text: language === 'ar' ? 'يمكن لتبرع واحد إنقاذ ما يصل إلى 3 أرواح' : 'Un don peut sauver jusqu\'à 3 vies' },
                      { icon: Clock, text: language === 'ar' ? '10-15 دقيقة فقط' : 'Seulement 10-15 minutes' },
                      { icon: Calendar, text: language === 'ar' ? 'التبرع ممكن كل 56 يومًا' : 'Don possible tous les 56 jours' },
                      { icon: Shield, text: language === 'ar' ? 'آمن تمامًا ومراقب طبيًا' : 'Totalement sécurisé et médicalement supervisé' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <item.icon className="h-5 w-5 text-primary" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full mt-4" onClick={handleLocateMe}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {tx.findCenter}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab 3: Reminders */}
          <TabsContent value="reminders" className="space-y-6">
            <Card className="glass-card max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'تذكيرات التبرع' : 'Rappels de Don'}
                </CardTitle>
                <CardDescription>
                  {tx.reminderInfo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isAuthenticated ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{tx.loginRequired}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>{tx.bloodType}</Label>
                      <Select
                        value={bloodProfile.bloodType || ''}
                        onValueChange={(value) => setBloodProfile({ ...bloodProfile, bloodType: value as BloodType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tx.selectBloodType} />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{tx.lastDonationDate}</Label>
                      <Input
                        type="date"
                        value={bloodProfile.lastDonationDate || ''}
                        onChange={(e) => setBloodProfile({ ...bloodProfile, lastDonationDate: e.target.value })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {bloodProfile.reminderEnabled ? (
                          <Bell className="h-5 w-5 text-primary" />
                        ) : (
                          <BellOff className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{tx.enableReminders}</p>
                          <p className="text-sm text-muted-foreground">{tx.reminderInfo}</p>
                        </div>
                      </div>
                      <Switch
                        checked={bloodProfile.reminderEnabled}
                        onCheckedChange={(checked) => setBloodProfile({ ...bloodProfile, reminderEnabled: checked })}
                      />
                    </div>
                    
                    <Button onClick={saveBloodProfile} className="w-full">
                      {tx.saveProfile}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab 4: Directory */}
          <TabsContent value="directory" className="space-y-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <Button
                variant={filterHasBloodBank ? "default" : "outline"}
                onClick={() => setFilterHasBloodBank(!filterHasBloodBank)}
              >
                <Hospital className="h-4 w-4 mr-2" />
                {tx.bloodBank}
              </Button>
              <Button
                variant={filterDonationAvailable ? "default" : "outline"}
                onClick={() => setFilterDonationAvailable(!filterDonationAvailable)}
              >
                <Droplet className="h-4 w-4 mr-2" />
                {tx.donationCenter}
              </Button>
              <Button
                variant={filterOpenNow ? "default" : "outline"}
                onClick={() => setFilterOpenNow(!filterOpenNow)}
              >
                <Clock className="h-4 w-4 mr-2" />
                {tx.openNow}
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))
              ) : filteredProviders.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{tx.noResults}</p>
                </div>
              ) : (
                filteredProviders.map((provider) => (
                  <Card key={provider.id} className="glass-card hover-lift cursor-pointer" onClick={() => handleCardClick(provider)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">{provider.name}</h3>
                        {provider.verified && (
                          <Badge variant="outline" className="text-primary border-primary text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {tx.verified}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {provider.address}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {provider.type === 'hospital' && (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                            {tx.bloodBank}
                          </Badge>
                        )}
                        {provider.type === 'blood_cabin' && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                            {tx.donationCenter}
                          </Badge>
                        )}
                        {provider.isOpen && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {tx.openNow}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {provider.rating}
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={`tel:${provider.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
