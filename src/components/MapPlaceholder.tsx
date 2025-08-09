import { MapPin } from "lucide-react";

interface MapPlaceholderProps {
  height?: number | string;
  label?: string;
}

const MapPlaceholder = ({ height = 400, label = "Google Maps placeholder" }: MapPlaceholderProps) => {
  return (
    <div
      className="rounded-lg bg-gradient-to-br from-muted/50 to-secondary/20 grid place-items-center text-muted-foreground relative overflow-hidden"
      style={{ height }}
      role="img"
      aria-label="Map placeholder"
    >
      <div className="text-center px-4">
        <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
        <div className="font-medium">{label}</div>
        <div className="text-xs opacity-70 mt-1">Real map will be integrated later</div>
      </div>
      {/* Faux markers */}
      <div className="absolute top-8 left-10 w-6 h-6 bg-primary rounded-full opacity-30" />
      <div className="absolute bottom-10 right-16 w-8 h-8 bg-secondary rounded-full opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-accent rounded-full opacity-20" />
    </div>
  );
};

export default MapPlaceholder;
