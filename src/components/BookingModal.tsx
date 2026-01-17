import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, Mail, Phone as PhoneIcon, User, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  providerName: string;
  providerId: string;
}

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

// Algerian phone number validation (05XX XX XX XX, 06XX XX XX XX, 07XX XX XX XX)
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limited = digits.slice(0, 10);
  
  // Format as XX XX XX XX XX
  if (limited.length <= 2) return limited;
  if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
  if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
  if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`;
  return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`;
};

const validatePhoneNumber = (value: string): { valid: boolean; error?: string } => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return { valid: false, error: 'Le numéro de téléphone est requis' };
  }
  
  if (digits.length < 10) {
    return { valid: false, error: 'Le numéro doit contenir 10 chiffres' };
  }
  
  if (!/^0[5-7]/.test(digits)) {
    return { valid: false, error: 'Le numéro doit commencer par 05, 06 ou 07' };
  }
  
  return { valid: true };
};

export const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange, providerName, providerId }) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'details' | 'datetime' | 'confirm'>('details');
  
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const createAppointmentMutation = useCreateAppointment();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    
    // Clear error while typing
    if (phoneError) {
      setPhoneError(null);
    }
  };

  const handlePhoneBlur = () => {
    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      setPhoneError(validation.error || null);
    }
  };

  const canProceed = () => {
    if (step === 'details') {
      const phoneValidation = validatePhoneNumber(phone);
      return name && phoneValidation.valid;
    }
    if (step === 'datetime') return selectedDate && selectedTime;
    return true;
  };

  const handleNext = () => {
    if (step === 'details') {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error || null);
        return;
      }
      setStep('datetime');
    } else if (step === 'datetime') {
      setStep('confirm');
    } else {
      confirm();
    }
  };

  const confirm = () => {
    if (!selectedDate || !selectedTime || !name || !phone) return;
    
    const [hours, minutes] = selectedTime.split(':');
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    createAppointmentMutation.mutate(
      {
        providerId,
        providerName,
        patientName: name,
        patientPhone: phone.replace(/\s/g, ''), // Store without spaces
        patientEmail: email || undefined,
        dateTime: appointmentDate.toISOString(),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          // Send notification
          sendNotification({
            userId: user?.uid || 'anonymous',
            type: 'appointment',
            title: 'Rendez-vous confirmé',
            body: `Rendez-vous avec ${providerName} le ${format(appointmentDate, 'EEEE d MMMM à HH:mm', { locale: fr })}`,
            link: '/appointments',
          });

          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">Rendez-vous confirmé!</p>
                <p className="text-sm">Vous recevrez une confirmation{email ? ' par email' : ''}</p>
              </div>
            </div>
          );
          
          // Reset form
          setStep('details');
          setSelectedDate(undefined);
          setSelectedTime('');
          setName('');
          setPhone('');
          setPhoneError(null);
          setEmail('');
          setNotes('');
          onOpenChange(false);
        },
        onError: (error) => {
          console.error('Booking error:', error);
          toast.error('Erreur lors de la réservation. Veuillez réessayer.');
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Prendre rendez-vous
          </DialogTitle>
          <DialogDescription>Avec {providerName}</DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[{label: 'Informations', value: 'details'}, {label: 'Date & Heure', value: 'datetime'}, {label: 'Confirmation', value: 'confirm'}].map((item, idx) => {
            const stepOrder = ['details', 'datetime', 'confirm'];
            const currentIdx = stepOrder.indexOf(step);
            const isCompleted = currentIdx > idx;
            const isCurrent = currentIdx === idx;
            
            return (
              <div key={item.value} className="flex items-center flex-1">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                  isCurrent ? "border-primary text-primary" : "border-muted text-muted-foreground"
                )}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:inline">{item.label}</span>
                {idx < 2 && <div className={cn("flex-1 h-0.5 mx-2", isCompleted ? "bg-primary" : "bg-muted")} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Patient Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Votre nom complet *
              </label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Ahmed Benali" 
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-primary" />
                  Téléphone *
                </label>
                <Input 
                  value={phone} 
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  placeholder="05 50 00 00 00"
                  className={cn(phoneError && "border-destructive focus-visible:ring-destructive")}
                />
                {phoneError ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {phoneError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Format: 05XX XX XX XX
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email (optionnel)
                </label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="votre@email.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <Input 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Raison de la visite, symptômes..." 
              />
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 'datetime' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sélectionner une date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Choisir un créneau horaire
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="h-auto py-2"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Récapitulatif de votre rendez-vous
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Praticien:</span>
                  <span className="font-medium">{providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {selectedDate && format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heure:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{phone}</span>
                </div>
                {email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{email}</span>
                  </div>
                )}
                {notes && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1">{notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                📧 Vous recevrez une confirmation{email ? ' par email' : ''} avec un rappel 24h avant le rendez-vous.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              if (step === 'details') {
                onOpenChange(false);
              } else {
                setStep(step === 'datetime' ? 'details' : 'datetime');
              }
            }}
            disabled={createAppointmentMutation.isPending}
          >
            {step === 'details' ? 'Annuler' : 'Retour'}
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed() || createAppointmentMutation.isPending}
          >
            {createAppointmentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Réservation...
              </>
            ) : (
              step === 'confirm' ? 'Confirmer le rendez-vous' : 'Continuer'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};