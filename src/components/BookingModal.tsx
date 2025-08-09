import React, { useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { saveAppointment } from '@/data/providers';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  providerName: string;
  providerId: string;
}

const hours = [9, 10, 11, 14, 15, 16, 17];

export const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange, providerName, providerId }) => {
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const slots = useMemo(() => {
    const out: string[] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(new Date(), d);
      for (const h of hours) {
        const dt = new Date(day);
        dt.setHours(h, 0, 0, 0);
        out.push(dt.toISOString());
      }
    }
    return out;
  }, []);

  const confirm = () => {
    if (!selectedISO || !name || !phone) return;
    saveAppointment({ id: crypto.randomUUID(), providerId, when: selectedISO, name, phone });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prendre rendez-vous</DialogTitle>
          <DialogDescription>Avec {providerName}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Votre nom</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom et prénom" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Téléphone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 0550 00 00 00" />
          </div>
        </div>

        <div className="space-y-3 mt-2">
          <div className="text-sm font-medium">Choisir un créneau (7 jours)</div>
          <div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2">
            {slots.map((iso) => (
              <button
                key={iso}
                onClick={() => setSelectedISO(iso)}
                className={`text-left px-3 py-2 rounded-lg border transition ${selectedISO === iso ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <div className="text-xs opacity-80">{format(new Date(iso), 'EEEE d MMM', { locale: fr })}</div>
                <div className="text-sm">{format(new Date(iso), 'HH:mm')}</div>
              </button>
            ))}
          </div>
          {selectedISO && (
            <div className="text-sm">Sélectionné: <Badge variant="secondary">{format(new Date(selectedISO), 'EEEE d MMM – HH:mm', { locale: fr })}</Badge></div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={confirm} disabled={!selectedISO || !name || !phone}>Confirmer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
