import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, ShieldCheck, Phone, Share2, Flag, Calendar, Languages, Award, Image as ImageIcon } from "lucide-react";
import { getProviderById } from "@/data/providers";
import { BookingModal } from "@/components/BookingModal";

const mockProvider = {
  id: "1",
  name: "Dr. Sara Bendaoud",
  title: "Cardiologist",
  rating: 4.9,
  reviews: 128,
  verified: true,
  address: "Av. Emir Abdelkader, Sidi Bel Abbès",
  phones: ["041 22 33 44", "0550 00 11 22"],
  email: "contact@drsara.dz",
  website: "https://drsara.dz",
  languages: ["ar", "fr", "en"],
  specializations: ["Cardiology", "Echocardiography"],
  experience: "15 years",
  diplomas: ["MD, University of Oran", "Cardiology Specialization"],
  description: "Specialist in cardiology providing comprehensive heart care and diagnostics.",
};

const ProviderProfilePage = () => {
  const { id } = useParams();
  const provider = useMemo(() => mockProvider, [id]);

  useEffect(() => {
    document.title = `${provider.name} – CityHealth Profile`;
  }, [provider.name]);

  return (
    <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <section className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-28 h-28 rounded-xl bg-primary/10 grid place-items-center text-primary">
            <ImageIcon className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              {provider.verified && (
                <Badge className="verified-badge">Verified</Badge>
              )}
              <Badge variant="secondary">Most Active This Week</Badge>
            </div>
            <p className="text-muted-foreground">{provider.title}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="inline-flex items-center gap-1 rating-stars"><Star className="h-4 w-4" /> {provider.rating}</span>
              <span className="text-muted-foreground">{provider.reviews} reviews</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>Book Appointment</Button>
            <Button variant="outline">Add to Favorites</Button>
            <Button variant="ghost"><Share2 className="h-4 w-4" /></Button>
            <Button variant="ghost"><Flag className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>About</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{provider.description}</p>
              <div className="flex flex-wrap gap-2">
                {provider.specializations.map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4" /> {provider.experience} experience</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Languages className="h-4 w-4" /> Languages: {provider.languages.join(", ")}</div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Gallery</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-lg bg-muted/50" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Recent Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">A{ i }</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                    <span className="ml-auto inline-flex items-center gap-1 rating-stars"><Star className="h-4 w-4" /> 5.0</span>
                  </div>
                  <p className="text-sm">Excellent care and very professional. Highly recommended.</p>
                </div>
              ))}
              <div className="flex justify-end"><Button variant="outline">View all reviews</Button></div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contact */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Contact</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {provider.address}</div>
              <div className="space-y-1">
                {provider.phones.map((p) => (
                  <a key={p} href={`tel:${p}`} className="inline-flex items-center gap-2 underline"><Phone className="h-4 w-4" /> {p}</a>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">Opening hours: Today 09:00–17:00</div>
              <Button variant="outline" className="w-full mt-2"><Calendar className="h-4 w-4 mr-2" /> Check availability</Button>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Location</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg h-56 bg-gradient-to-br from-muted/50 to-secondary/20 grid place-items-center text-muted-foreground">
                Google Maps placeholder
              </div>
              <Button variant="outline" className="w-full mt-3">Open in Maps</Button>
            </CardContent>
          </Card>

          {/* Offers */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Announcements</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-primary/10">New echocardiography service this month.</div>
              <div className="p-3 rounded-lg bg-secondary/10">Extended hours on Saturday.</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default ProviderProfilePage;
