import { useState } from 'react';
import { Menu, LogOut, Settings, User as UserIcon, Calendar, Bot, Stethoscope, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Header = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
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

  const navLinks = [
    { to: '/', label: t('nav', 'home') },
    { to: '/search', label: t('header', 'providers') },
    { to: '/ai-health-chat', label: isRTL ? 'مساعد الذكاء الاصطناعي' : 'Assistant IA', icon: Bot },
    { to: '/emergency', label: t('nav', 'emergency') },
    { to: '/contact', label: t('header', 'contact') },
  ];

  const isProvider = profile?.roles?.includes('provider');

  const providerCTAText = {
    fr: 'Professionnel de santé ?',
    ar: 'متخصص في الصحة؟',
    en: 'Healthcare Professional?',
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="CityHealth Home"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">CH</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CityHealth
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2"
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
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
            {/* Partner CTA for non-providers */}
            {!isProvider && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/provider/register')}
                className="hidden lg:flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10 group"
              >
                <Stethoscope className="h-4 w-4" />
                {providerCTAText[language]}
                <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
              </Button>
            )}

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
                className="md:hidden"
                aria-label="Open mobile menu"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'left' : 'right'} className="w-[280px] bg-background/95 backdrop-blur-lg">
              <nav className="flex flex-col gap-4 mt-8" role="navigation" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-accent/50"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile Provider CTA */}
                {!isProvider && (
                  <Link
                    to="/provider/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-primary hover:text-primary/80 transition-colors py-2 px-4 rounded-lg bg-primary/10 flex items-center gap-2"
                  >
                    <Stethoscope className="h-5 w-5" />
                    {providerCTAText[language]}
                  </Link>
                )}
                
                <div className="border-t border-border/40 pt-4 mt-4 space-y-3">
                  {/* Mobile Language Toggle */}
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

                  {isAuthenticated ? (
                    <>
                      <Button variant="outline" className="w-full" onClick={() => { setMobileMenuOpen(false); }}>
                        <Link to="/profile" className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {t('header', 'profile')}
                        </Link>
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                        <LogOut className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
