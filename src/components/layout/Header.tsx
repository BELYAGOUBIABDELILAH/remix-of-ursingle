import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, LogOut, Settings, User as UserIcon, Calendar, Bot, Stethoscope, Sparkles,
  MapPin, Phone, Heart, Search, ChevronDown, Droplet, AlertTriangle, Home, Info, HelpCircle, UserPlus, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface NavSection {
  label: string;
  items: {
    label: string;
    href: string;
    icon: typeof Home;
    description?: string;
    isDestructive?: boolean;
  }[];
}

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { profile, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languageLabels = {
    fr: { flag: '🇫🇷', label: 'Français' },
    ar: { flag: '🇩🇿', label: 'العربية' },
    en: { flag: '🇬🇧', label: 'English' },
  };

  const userInitials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const isProvider = profile?.roles?.includes('provider');

  // Translations for nav sections
  const tx = {
    fr: {
      discover: 'Découvrir',
      services: 'Services',
      emergency: 'Urgences',
      pro: 'Pro',
      home: 'Accueil',
      why: 'Pourquoi CityHealth',
      how: 'Comment ça marche',
      map: 'Carte interactive',
      search: 'Rechercher',
      aiAssistant: 'Assistant IA',
      bloodDonation: 'Don de sang',
      emergencyServices: 'Services d\'urgence',
      emergencyCall: 'Appeler le 15',
      providerRegister: 'Devenir prestataire',
      providerDashboard: 'Espace praticien',
      mapDesc: 'Tous les prestataires de santé',
      searchDesc: 'Recherche par spécialité',
      aiDesc: 'Conseils santé personnalisés',
      bloodDesc: 'Centres de don et urgences',
      emergencyDesc: 'Hôpitaux 24/7',
      providerDesc: 'Rejoignez notre réseau',
      dashboardDesc: 'Gérez vos rendez-vous'
    },
    ar: {
      discover: 'اكتشف',
      services: 'الخدمات',
      emergency: 'الطوارئ',
      pro: 'للمحترفين',
      home: 'الرئيسية',
      why: 'لماذا CityHealth',
      how: 'كيف يعمل',
      map: 'الخريطة التفاعلية',
      search: 'البحث',
      aiAssistant: 'المساعد الذكي',
      bloodDonation: 'التبرع بالدم',
      emergencyServices: 'خدمات الطوارئ',
      emergencyCall: 'اتصل بـ 15',
      providerRegister: 'كن مقدم خدمة',
      providerDashboard: 'لوحة المقدم',
      mapDesc: 'جميع مقدمي الرعاية الصحية',
      searchDesc: 'بحث حسب التخصص',
      aiDesc: 'نصائح صحية مخصصة',
      bloodDesc: 'مراكز التبرع والطوارئ',
      emergencyDesc: 'مستشفيات 24/7',
      providerDesc: 'انضم إلى شبكتنا',
      dashboardDesc: 'إدارة مواعيدك'
    },
    en: {
      discover: 'Discover',
      services: 'Services',
      emergency: 'Emergency',
      pro: 'Pro',
      home: 'Home',
      why: 'Why CityHealth',
      how: 'How it works',
      map: 'Interactive Map',
      search: 'Search',
      aiAssistant: 'AI Assistant',
      bloodDonation: 'Blood Donation',
      emergencyServices: 'Emergency Services',
      emergencyCall: 'Call 15',
      providerRegister: 'Become a provider',
      providerDashboard: 'Provider Dashboard',
      mapDesc: 'All healthcare providers',
      searchDesc: 'Search by specialty',
      aiDesc: 'Personalized health advice',
      bloodDesc: 'Donation centers',
      emergencyDesc: 'Hospitals 24/7',
      providerDesc: 'Join our network',
      dashboardDesc: 'Manage appointments'
    }
  };

  const texts = tx[language as keyof typeof tx] || tx.fr;

  const navSections: NavSection[] = [
    {
      label: texts.discover,
      items: [
        { label: texts.home, href: '/', icon: Home },
        { label: texts.why, href: '/why', icon: Info },
        { label: texts.how, href: '/how', icon: HelpCircle },
      ]
    },
    {
      label: texts.services,
      items: [
        { label: texts.map, href: '/carte', icon: MapPin, description: texts.mapDesc },
        { label: texts.search, href: '/search', icon: Search, description: texts.searchDesc },
        { label: texts.aiAssistant, href: '/medical-assistant', icon: Bot, description: texts.aiDesc },
        { label: texts.bloodDonation, href: '/blood-donation', icon: Droplet, description: texts.bloodDesc },
      ]
    },
    {
      label: texts.emergency,
      items: [
        { label: texts.emergencyServices, href: '/carte?mode=emergency', icon: AlertTriangle, description: texts.emergencyDesc },
        { label: texts.emergencyCall, href: 'tel:15', icon: Phone, isDestructive: true },
      ]
    },
    {
      label: texts.pro,
      items: [
        { label: texts.providerRegister, href: '/provider/register', icon: UserPlus, description: texts.providerDesc },
        { label: texts.providerDashboard, href: '/provider/dashboard', icon: Building2, description: texts.dashboardDesc },
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  const NavDropdown = ({ section }: { section: NavSection }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "flex items-center gap-1 h-9 px-3",
            section.items.some(item => isActive(item.href)) && "bg-primary/10 text-primary"
          )}
        >
          {section.label}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-popover/95 backdrop-blur-lg">
        {section.items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            {item.href.startsWith('tel:') ? (
              <a href={item.href} className="flex items-center gap-3 cursor-pointer">
                <item.icon className="h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">{item.label}</span>
              </a>
            ) : (
              <Link to={item.href} className="flex items-center gap-3 cursor-pointer">
                <item.icon className={cn("h-4 w-4", isActive(item.href) && "text-primary")} />
                <div>
                  <div className={cn("font-medium", isActive(item.href) && "text-primary")}>{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  )}
                </div>
              </Link>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60",
      isRTL && "rtl"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="CityHealth Home"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CityHealth
            </span>
            <p className="text-xs text-muted-foreground -mt-0.5">Sidi Bel Abbès</p>
          </div>
        </Link>

        {/* Desktop Navigation - Sections with Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navSections.map((section) => (
            <NavDropdown key={section.label} section={section} />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Emergency Button - Always visible */}
          <Button
            variant="destructive"
            size="sm"
            className="hidden md:flex items-center gap-2"
            asChild
          >
            <a href="tel:15">
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">15</span>
            </a>
          </Button>

          {/* Language Selector - Hidden on Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent hidden sm:flex"
                aria-label="Select language"
              >
                <span className="text-lg">{languageLabels[language].flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-lg border-border/50 z-50">
              {Object.entries(languageLabels).map(([lang, { flag, label }]) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang as 'fr' | 'ar' | 'en')}
                  className="cursor-pointer"
                >
                  <span className={`${isRTL ? 'ml-2' : 'mr-2'} text-lg`}>{flag}</span>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification Center */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <NotificationCenter />
            </div>
          )}

          {/* User Menu or Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{profile?.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                      {t('header', 'profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">
                      <Heart className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                      {isRTL ? 'المفضلة' : 'Favoris'}
                    </Link>
                  </DropdownMenuItem>
                  {profile?.roles.includes('patient') && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <Calendar className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                        {isRTL ? 'لوحة التحكم' : 'Tableau de bord'}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isProvider && (
                    <DropdownMenuItem asChild>
                      <Link to="/provider/dashboard" className="cursor-pointer">
                        <Stethoscope className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                        {isRTL ? 'لوحة مقدم الخدمة' : 'Espace Praticien'}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                      {t('header', 'settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {t('header', 'logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/auth')}
                >
                  {t('header', 'signin')}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  onClick={() => navigate('/auth')}
                >
                  {t('header', 'signup')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                aria-label="Open mobile menu"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'left' : 'right'} className="w-[300px] bg-background/95 backdrop-blur-lg">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  CityHealth
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-6 mt-6" role="navigation" aria-label="Mobile navigation">
                {navSections.map((section) => (
                  <div key={section.label}>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {section.label}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        item.href.startsWith('tel:') ? (
                          <a
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </a>
                        ) : (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                              isActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Mobile Language Selector */}
                <div className="border-t border-border/40 pt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <span className={isRTL ? 'ml-2' : 'mr-2'}>{languageLabels[language].flag}</span>
                        {languageLabels[language].label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {Object.entries(languageLabels).map(([lang, { flag, label }]) => (
                        <DropdownMenuItem
                          key={lang}
                          onClick={() => setLanguage(lang as 'fr' | 'ar' | 'en')}
                        >
                          <span className={isRTL ? 'ml-2' : 'mr-2'}>{flag}</span>
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Auth */}
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <UserIcon className="h-4 w-4 mr-2" />
                          {t('header', 'profile')}
                        </Link>
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('header', 'logout')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => { 
                          navigate('/auth');
                          setMobileMenuOpen(false); 
                        }}
                      >
                        {t('header', 'signin')}
                      </Button>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent" 
                        onClick={() => { 
                          navigate('/auth');
                          setMobileMenuOpen(false); 
                        }}
                      >
                        {t('header', 'signup')}
                      </Button>
                    </>
                  )}
                </div>

                {/* Emergency Button in Mobile */}
                <a
                  href="tel:15"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium"
                >
                  <Phone className="h-5 w-5" />
                  {texts.emergencyCall}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
