import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  Star,
  Shield,
  Users,
  Map
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
import { cn } from '@/lib/utils';

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] as const;

type BloodType = typeof BLOOD_TYPES[number];

interface BloodProfile {
  bloodType?: BloodType;
  lastDonationDate?: string;
  reminderEnabled: boolean;
}

export default function BloodDonationPage() {
  const { isRTL, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  // Eligibility checker state
  const [eligibilityAge, setEligibilityAge] = useState('');
  const [eligibilityWeight, setEligibilityWeight] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<'eligible' | 'not_yet' | null>(null);
  const [nextEligibleDate, setNextEligibleDate] = useState<string | null>(null);
  
  // Blood profile (for authenticated users)
  const [bloodProfile, setBloodProfile] = useState<BloodProfile>({
    reminderEnabled: false
  });
  
  // Translations
  const texts = useMemo(() => ({
    fr: {
      title: 'Don de Sang & Recherche d\'Urgence',
      subtitle: 'Trouvez rapidement les hôpitaux et centres de don de sang à Sidi Bel Abbès',
      emergencyFinder: 'Recherche d\'Urgence',
      donateBlood: 'Donner du Sang',
      reminders: 'Rappels',
      info: 'Informations',
      selectBloodType: 'Sélectionnez votre groupe sanguin',
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
      viewMap: 'Voir la carte interactive',
      bloodType: 'Groupe sanguin',
      saveProfile: 'Sauvegarder mon profil sanguin',
      enableReminders: 'Activer les rappels de don',
      reminderInfo: 'Recevez une notification tous les 3 mois',
      loginRequired: 'Connectez-vous pour sauvegarder vos préférences',
      whyDonate: 'Pourquoi donner son sang ?',
      fact1: 'Un don peut sauver jusqu\'à 3 vies',
      fact2: 'Seulement 10-15 minutes',
      fact3: 'Don possible tous les 56 jours',
      fact4: 'Totalement sécurisé et médicalement supervisé',
    },
    ar: {
      title: 'التبرع بالدم والبحث الطارئ',
      subtitle: 'ابحث بسرعة عن المستشفيات ومراكز التبرع بالدم في سيدي بلعباس',
      emergencyFinder: 'البحث الطارئ',
      donateBlood: 'تبرع بالدم',
      reminders: 'التذكيرات',
      info: 'معلومات',
      selectBloodType: 'اختر فصيلة دمك',
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
      viewMap: 'عرض الخريطة التفاعلية',
      bloodType: 'فصيلة الدم',
      saveProfile: 'حفظ ملف الدم الخاص بي',
      enableReminders: 'تفعيل تذكيرات التبرع',
      reminderInfo: 'تلقي إشعار كل 3 أشهر',
      loginRequired: 'سجل الدخول لحفظ تفضيلاتك',
      whyDonate: 'لماذا التبرع بالدم؟',
      fact1: 'يمكن لتبرع واحد إنقاذ ما يصل إلى 3 أرواح',
      fact2: '10-15 دقيقة فقط',
      fact3: 'التبرع ممكن كل 56 يومًا',
      fact4: 'آمن تمامًا ومراقب طبيًا',
    },
    en: {
      title: 'Blood Donation & Emergency Finder',
      subtitle: 'Quickly find hospitals and blood donation centers in Sidi Bel Abbès',
      emergencyFinder: 'Emergency Finder',
      donateBlood: 'Donate Blood',
      reminders: 'Reminders',
      info: 'Information',
      selectBloodType: 'Select your blood type',
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
      viewMap: 'View interactive map',
      bloodType: 'Blood type',
      saveProfile: 'Save my blood profile',
      enableReminders: 'Enable donation reminders',
      reminderInfo: 'Receive a notification every 3 months',
      loginRequired: 'Log in to save your preferences',
      whyDonate: 'Why donate blood?',
      fact1: 'One donation can save up to 3 lives',
      fact2: 'Only 10-15 minutes',
      fact3: 'Donation possible every 56 days',
      fact4: 'Completely safe and medically supervised',
    }
  }), []);
  
  const tx = texts[language as keyof typeof texts] || texts.fr;
  
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
        
        {/* CTA - View Map */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link to="/map/blood">
              <Map className="h-5 w-5" />
              {tx.viewMap}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link to="/map/emergency">
              <AlertTriangle className="h-5 w-5" />
              {tx.emergencyFinder}
            </Link>
          </Button>
        </div>
        
        {/* Main Tabs */}
        <Tabs defaultValue="donate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
            <TabsTrigger value="donate" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Heart className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.donateBlood}</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.reminders}</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Info className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.info}</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Donate Blood */}
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
                    {tx.whyDonate}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {[
                      { icon: Users, text: tx.fact1 },
                      { icon: Clock, text: tx.fact2 },
                      { icon: Calendar, text: tx.fact3 },
                      { icon: Shield, text: tx.fact4 }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <item.icon className="h-5 w-5 text-primary" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full mt-4" asChild>
                    <Link to="/map/blood">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tx.findCenter}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab 2: Reminders */}
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
          
          {/* Tab 3: Info */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-destructive" />
                    {language === 'ar' ? 'فصائل الدم' : 'Groupes Sanguins'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {BLOOD_TYPES.map((type) => (
                      <Badge key={type} variant="outline" className="text-lg py-2 px-4">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'O- هو المتبرع العام، AB+ هو المتلقي العام'
                      : 'O- est le donneur universel, AB+ est le receveur universel'
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hospital className="h-5 w-5 text-primary" />
                    {language === 'ar' ? 'أين تتبرع؟' : 'Où donner ?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    {language === 'ar'
                      ? 'يمكنك التبرع في المستشفيات ومراكز التبرع بالدم المعتمدة.'
                      : 'Vous pouvez donner dans les hôpitaux et centres de don agréés.'
                    }
                  </p>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/carte?mode=blood">
                      <Map className="h-4 w-4 mr-2" />
                      {tx.viewMap}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    {language === 'ar' ? 'أرقام الطوارئ' : 'Numéros d\'urgence'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <span className="font-medium">SAMU</span>
                    <a href="tel:15" className="text-destructive font-bold text-lg">15</a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{language === 'ar' ? 'الحماية المدنية' : 'Protection Civile'}</span>
                    <a href="tel:14" className="font-bold text-lg">14</a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
