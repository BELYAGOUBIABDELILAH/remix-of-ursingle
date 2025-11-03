import { useState } from 'react';
import { Search, MapPin, Stethoscope, Building2, Pill, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export const QuickSearchSection = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [providerType, setProviderType] = useState('');
  const [location, setLocation] = useState('');

  const providerTypes = [
    { value: 'doctor', label: 'Médecin', icon: Stethoscope },
    { value: 'clinic', label: 'Clinique', icon: Building2 },
    { value: 'pharmacy', label: 'Pharmacie', icon: Pill },
    { value: 'lab', label: 'Laboratoire', icon: FlaskConical },
  ];

  const handleSearch = () => {
    console.log('Search:', { searchQuery, providerType, location });
    // Navigate to search results
  };

  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <Card className="p-8 shadow-xl border-primary/20 bg-card/50 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Recherche Rapide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Nom ou spécialité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-primary/20 focus:border-primary"
              />
            </div>

            {/* Provider Type */}
            <Select value={providerType} onValueChange={setProviderType}>
              <SelectTrigger className="h-12 rounded-xl border-primary/20">
                <SelectValue placeholder="Type de prestataire" />
              </SelectTrigger>
              <SelectContent>
                {providerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Localisation..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12 rounded-xl border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Search className="mr-2 h-5 w-5" />
            Lancer la recherche
          </Button>
        </Card>
      </div>
    </section>
  );
};
