import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Star, MessageSquare, CheckCircle, XCircle, AlertCircle, Download, FileText, Loader2 } from 'lucide-react';
import { usePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import { usePatientReviews } from '@/hooks/useReviews';
import { Appointment } from '@/types/appointments';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import jsPDF from 'jspdf';

const PatientDashboard = () => {
  const { profile, isAuthenticated, user } = useAuth();
  const { t, language } = useLanguage();

  // Firestore appointments via TanStack Query
  const { data: appointments = [], isLoading: appointmentsLoading } = usePatientAppointments();
  const { mutate: cancelAppointmentMutation, isPending: isCancelling } = useCancelAppointment();
  
  // Firestore reviews via TanStack Query (using user.uid for query)
  const { data: reviews = [], isLoading: reviewsLoading } = usePatientReviews(user?.uid);

  const locales = { fr, ar, en: enUS };

  const handleCancelAppointment = (id: string) => {
    cancelAppointmentMutation(id, {
      onSuccess: () => {
        toast.success('Rendez-vous annulé');
      },
      onError: () => {
        toast.error('Erreur lors de l\'annulation');
      }
    });
  };

  // Export appointments to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Primary blue
    doc.text('Mes Rendez-vous - CityHealth', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exporté le ${format(new Date(), 'PPP', { locale: fr })}`, pageWidth / 2, 28, { align: 'center' });
    
    let yPosition = 45;
    
    // Upcoming appointments section
    if (upcomingAppointments.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Rendez-vous à venir', 14, yPosition);
      yPosition += 10;
      
      upcomingAppointments.forEach((apt) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`• ${apt.providerName}`, 14, yPosition);
        yPosition += 6;
        
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`  Date: ${format(new Date(apt.dateTime), 'PPP à p', { locale: fr })}`, 14, yPosition);
        yPosition += 5;
        
        if (apt.notes) {
          doc.text(`  Notes: ${apt.notes}`, 14, yPosition);
          yPosition += 5;
        }
        yPosition += 5;
      });
    }
    
    // Past appointments section
    if (pastAppointments.length > 0) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Historique', 14, yPosition);
      yPosition += 10;
      
      pastAppointments.slice(0, 10).forEach((apt) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(apt.status === 'cancelled' ? 150 : 0);
        doc.text(`• ${apt.providerName} (${apt.status === 'completed' ? 'Terminé' : 'Annulé'})`, 14, yPosition);
        yPosition += 6;
        
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`  Date: ${format(new Date(apt.dateTime), 'PPP', { locale: fr })}`, 14, yPosition);
        yPosition += 8;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('CityHealth - Sidi Bel Abbès', pageWidth / 2, 290, { align: 'center' });
    
    // Save
    doc.save(`rendez-vous-cityhealth-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF téléchargé!');
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'confirmed' || apt.status === 'pending'
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastAppointments = appointments.filter(
    apt => apt.status === 'completed' || apt.status === 'cancelled'
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const getStatusBadge = (status: Appointment['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: AlertCircle, label: 'En attente' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, label: 'Confirmé' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, label: 'Annulé' },
      completed: { variant: 'outline' as const, icon: CheckCircle, label: 'Terminé' },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Note: Authentication check removed - CitizenGuard handles this in App.tsx

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Mon Tableau de Bord
              </h1>
              <p className="text-muted-foreground">
                Bienvenue, {profile?.full_name}
              </p>
            </div>
            
            {/* Export PDF Button */}
            {appointments.length > 0 && (
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                <FileText className="h-4 w-4" />
                Exporter PDF
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rendez-vous à venir</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total rendez-vous</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{appointments.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avis donnés</CardTitle>
                <MessageSquare className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reviews.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="upcoming">À venir</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="reviews">Mes avis</TabsTrigger>
            </TabsList>

            {/* Upcoming Appointments */}
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Aucun rendez-vous à venir</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((apt) => (
                  <Card key={apt.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{apt.providerName}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(apt.dateTime), 'PPP', { locale: locales[language] })}
                            <Clock className="h-4 w-4 ml-2" />
                            {format(new Date(apt.dateTime), 'p', { locale: locales[language] })}
                          </CardDescription>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {apt.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {apt.notes}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {apt.status !== 'cancelled' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelAppointment(apt.id)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Annuler'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Past Appointments */}
            <TabsContent value="history" className="space-y-4">
              {pastAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Aucun historique de rendez-vous</p>
                  </CardContent>
                </Card>
              ) : (
                pastAppointments.map((apt) => (
                  <Card key={apt.id} className="opacity-80">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{apt.providerName}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(apt.dateTime), 'PPP', { locale: locales[language] })}
                          </CardDescription>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                    </CardHeader>
                    {apt.notes && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {apt.notes}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Aucun avis donné</p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Avis pour {review.providerId}</CardTitle>
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                          {review.status === 'approved' ? 'Publié' : 'En attente'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt), 'PPP', { locale: locales[language] })}
                      </p>
                      {review.providerResponse && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Réponse du professionnel:</p>
                          <p className="text-sm text-muted-foreground">{review.providerResponse.text}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PatientDashboard;
