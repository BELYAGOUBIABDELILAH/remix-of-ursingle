import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Ambulance, MapPin, PhoneCall, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const mockServices = [
  { id: 1, name: "CHU Abdelkader", type: "Hospital", distance: 2.1, open: true, phone: "041 12 34 56" },
  { id: 2, name: "Clinique El Amal", type: "Clinic", distance: 4.7, open: true, phone: "041 22 11 00" },
  { id: 3, name: "Pharmacie de garde", type: "Pharmacy", distance: 1.2, open: true, phone: "041 55 66 77" },
  { id: 4, name: "Urgences Cardiologie", type: "Hospital", distance: 6.3, open: true, phone: "041 33 22 11" },
];

const EmergencyPage = () => {
  useEffect(() => {
    document.title = "CityHealth – Emergency Services";
  }, []);

  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return mockServices.filter(s => (type === "all" || s.type === type) && s.name.toLowerCase().includes(q.toLowerCase()));
  }, [type, q]);

  return (
    <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <header className="emergency-alert flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">EMERGENCY • Open services near you</span>
        </div>
        <a href="tel:14" className="inline-flex items-center gap-2 underline">
          <PhoneCall className="h-4 w-4" /> Call 14
        </a>
      </header>

      <section className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Left: Filters + List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">Filters</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Hospital">Hospitals</SelectItem>
                  <SelectItem value="Clinic">Clinics</SelectItem>
                  <SelectItem value="Pharmacy">On-duty Pharmacies</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Search service…" value={q} onChange={(e) => setQ(e.target.value)} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filtered.map((s) => (
              <Card key={s.id} className="glass-card hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{s.name}</span>
                        <span className="verified-badge">OPEN</span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Ambulance className="h-4 w-4" /> {s.type}
                        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {s.distance} km</span>
                      </div>
                    </div>
                    <a className="text-sm underline" href={`tel:${s.phone}`}>{s.phone}</a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Map Placeholder */}
        <div className="lg:col-span-2">
          <Card className="glass-card h-[520px]">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Emergency map (Google Maps coming soon)</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-muted/50 to-secondary/20 grid place-items-center text-muted-foreground">
                <div className="text-center">
                  <Ambulance className="mx-auto mb-2" />
                  <p>Interactive map placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* First aid guide */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { title: "Bleeding", tip: "Apply pressure with a clean cloth and call 14 if severe." },
              { title: "Fracture", tip: "Immobilize the limb; avoid moving the patient unnecessarily." },
              { title: "Burn", tip: "Cool under running water for 10 minutes; do not apply creams." },
            ].map((g) => (
              <Card key={g.title} className="glass-card">
                <CardHeader className="py-4"><CardTitle className="text-base">{g.title}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{g.tip}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmergencyPage;
