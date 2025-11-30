import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AntigravityHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Product', href: '#' },
    { label: 'Use Cases', href: '#', hasDropdown: true },
    { label: 'Pricing', href: '#' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resources', href: '#', hasDropdown: true },
  ];

  const languages = [
    { code: 'fr', name: 'FR', flag: '🇫🇷' },
    { code: 'ar', name: 'AR', flag: '🇩🇿' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            {/* Text hidden on mobile, shown on desktop */}
            <span className="hidden sm:block text-xl font-bold text-foreground">
              CityHealth
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.hasDropdown ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-foreground transition-colors">
                        {link.label}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem>Item 1</DropdownMenuItem>
                      <DropdownMenuItem>Item 2</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <a
                    href={link.href}
                    className="text-sm font-medium text-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Right side - Language + CTA */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-foreground transition-colors">
                  {languages.find((l) => l.code === language)?.flag}
                  <span className="hidden sm:inline">
                    {languages.find((l) => l.code === language)?.name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA Button - Black Pill */}
            <Button
              onClick={() => navigate('/search')}
              className="btn-primary-pill shadow-soft hover:shadow-lifted"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
