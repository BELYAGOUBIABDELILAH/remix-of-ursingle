import { Link } from 'react-router-dom';
import { Stethoscope, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const ModernFooter = () => {
  const { language, setLanguage } = useLanguage();

  const footerLinks = {
    quickLinks: [
      { label: 'Contact', path: '/contact' },
      { label: 'Conditions', path: '/terms' },
      { label: 'Mentions légales', path: '/legal' },
      { label: 'Confidentialité', path: '/privacy' }
    ],
    social: [
      { icon: Facebook, href: '#', label: 'Facebook' },
      { icon: Instagram, href: '#', label: 'Instagram' },
      { icon: Twitter, href: '#', label: 'Twitter' },
      { icon: Linkedin, href: '#', label: 'LinkedIn' }
    ]
  };

  return (
    <footer className="bg-secondary/20 border-t border-primary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CityHealth
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              Votre plateforme de santé locale à Sidi Bel Abbès. Trouvez et prenez rendez-vous avec les meilleurs professionnels de santé en quelques clics.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Sidi Bel Abbès, Algérie</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+213 XX XX XX XX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@cityhealth.dz</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Liens rapides</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Language */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Suivez-nous</h3>
            <div className="flex gap-2 mb-6">
              {footerLinks.social.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <social.icon className="h-5 w-5 text-primary" />
                </a>
              ))}
            </div>

            {/* Language Selector */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground">Langue</h4>
              <div className="flex gap-2">
                {['fr', 'ar', 'en'].map((lang) => (
                  <Button
                    key={lang}
                    variant={language === lang ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage(lang as 'fr' | 'ar' | 'en')}
                    className={`${
                      language === lang 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'border-primary/20 hover:bg-primary/10'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary/10 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CityHealth. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
