import React from 'react';
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
  Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { t, language, setLanguage } = useLanguage();

  const footerSections = [
    {
      title: "Services",
      links: [
        { label: "Recherche médecins", href: "/search" },
        { label: "Urgences 24/7", href: "/emergency" },
        { label: "Pharmacies", href: "/pharmacies" },
        { label: "Laboratoires", href: "/labs" },
        { label: "Cliniques", href: "/clinics" }
      ]
    },
    {
      title: "Prestataires",
      links: [
        { label: "Devenir partenaire", href: "/providers" },
        { label: "Espace praticien", href: "/provider-dashboard" },
        { label: "Vérification", href: "/verification" },
        { label: "Tarifs partenaires", href: "/pricing" },
        { label: "Support professionnel", href: "/pro-support" }
      ]
    },
    {
      title: "À propos",
      links: [
        { label: "Notre mission", href: "/about" },
        { label: "Équipe", href: "/team" },
        { label: "Carrières", href: "/careers" },
        { label: "Presse", href: "/press" },
        { label: "Blog", href: "/blog" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Centre d'aide", href: "/help" },
        { label: "Contact", href: "/contact" },
        { label: "FAQ", href: "/faq" },
        { label: "Sécurité", href: "/security" },
        { label: "Signaler un problème", href: "/report" }
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
    <footer className="bg-background border-t border-border/50">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">CityHealth</h3>
                <p className="text-sm text-muted-foreground">Sidi Bel Abbès</p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              La plateforme de référence pour connecter les citoyens avec les meilleurs 
              prestataires de santé vérifiés de Sidi Bel Abbès et sa région.
            </p>

            {/* Contact info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Sidi Bel Abbès, Algérie</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+213 48 XX XX XX</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@cityhealth.dz</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted/50 hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Language selector */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                    className="flex items-center gap-2"
                  >
                    <span>{lang.flag}</span>
                    <span className="text-xs">{lang.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Emergency contact */}
            <div className="text-center sm:text-right">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <Heart className="h-4 w-4" />
                <span className="font-medium">Urgences médicales</span>
              </div>
              <div className="text-2xl font-bold text-red-600">15</div>
              <div className="text-xs text-muted-foreground">Disponible 24h/24</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <span>© 2024 CityHealth. Tous droits réservés.</span>
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Conditions d'utilisation
              </Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">
                Politique des cookies
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>en Algérie</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;