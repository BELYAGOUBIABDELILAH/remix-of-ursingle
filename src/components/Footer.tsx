import { Link } from 'react-router-dom';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Stethoscope,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { AIHealthAssistant } from '@/components/AIHealthAssistant';

const Footer = () => {
  const { t, language, setLanguage } = useLanguage();

  const footerSections = [
    {
      title: "Services",
      links: [
        { label: "Recherche médecins", href: "/search" },
        { label: "Carte interactive", href: "/map" },
        { label: "Urgences 24/7", href: "/emergency" },
        { label: "Assistant IA Santé", href: "/ai-health-chat" },
        { label: "Mes favoris", href: "/favorites" }
      ]
    },
    {
      title: "Professionnels",
      links: [
        { label: "Devenir partenaire", href: "/providers" },
        { label: "Espace praticien", href: "/provider/dashboard" },
        { label: "Inscription praticien", href: "/provider/register" },
        { label: "Tableau admin", href: "/admin/dashboard" }
      ]
    },
    {
      title: "À propos",
      links: [
        { label: "Pourquoi CityHealth", href: "/why" },
        { label: "Comment ça marche", href: "/how" },
        { label: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Mon compte",
      links: [
        { label: "Connexion", href: "/auth" },
        { label: "Mon profil", href: "/profile" },
        { label: "Tableau de bord", href: "/dashboard" },
        { label: "Paramètres", href: "/settings" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/cityhealth", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/cityhealth", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/cityhealth", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/cityhealth", label: "LinkedIn" }
  ];

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇩🇿' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border/50">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-6 gap-12">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">CityHealth</h3>
                <p className="text-sm text-muted-foreground">Sidi Bel Abbès</p>
              </div>
            </Link>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              La plateforme de référence pour connecter les citoyens avec les meilleurs 
              prestataires de santé vérifiés de Sidi Bel Abbès et sa région.
            </p>

            {/* Contact info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>Sidi Bel Abbès, Algérie</span>
              </div>
              <a 
                href="tel:+21348000000"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span>+213 48 XX XX XX</span>
              </a>
              <a 
                href="mailto:contact@cityhealth.dz"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>contact@cityhealth.dz</span>
              </a>
            </div>

            {/* Social links */}
            <div className="flex gap-2 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-xl flex items-center justify-center transition-all duration-200 group"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Language selector */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h4 className="flex items-center gap-2 font-medium text-foreground mb-3">
                <Globe className="h-4 w-4" />
                Choisir la langue
              </h4>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage(lang.code as any)}
                    className={`flex items-center gap-2 ${
                      language === lang.code 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-xs">{lang.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Emergency contact */}
            <div className="text-center sm:text-right p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-600 mb-1 justify-center sm:justify-end">
                <Heart className="h-4 w-4" />
                <span className="font-medium">Urgences médicales</span>
              </div>
              <div className="text-3xl font-bold text-red-600">15</div>
              <div className="text-xs text-red-600/70">Disponible 24h/24</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/50 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span>© 2024 CityHealth. Tous droits réservés.</span>
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Conditions
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              <span>en Algérie 🇩🇿</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Health Assistant */}
      <AIHealthAssistant />
    </footer>
  );
};

export default Footer;
