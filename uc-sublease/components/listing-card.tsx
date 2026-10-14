import { useState } from "react";
import { ChevronRight, Sofa } from "lucide-react";
import type { Listing } from "@/lib/types";
import { fmtMiles, fmtMoney, fmtRange, HOOD_STYLE } from "@/lib/format";
import { priceInsight } from "@/lib/insights";
import { PHOTO_VT } from "@/lib/transition";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Photo } from "./photo";
import { SaveButton } from "./save-button";

// The face of a deck card. Fills its parent, so the parent controls the size.
export function ListingCard({ listing: l, interactive = false, preview = false }: { listing: Listing; interactive?: boolean; preview?: boolean }) {
  const { listings } = useStore();
  const insight = priceInsight(l, listings);
  const [i, setI] = useState(0);
  const last = l.photos.length - 1;
  // Tap the left third of the photo for the previous picture, anywhere else for the next one.
  const cycle = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const back = e.clientX - r.left < r.width / 3;
    setI((n) => (back ? Math.max(0, n - 1) : Math.min(last, n + 1)));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-float">
      <div data-photo className="relative min-h-0 flex-1" onClick={interactive ? cycle : undefined}>
        <Photo key={i} listing={l} index={i} className="absolute inset-0 animate-in fade-in duration-200" priority={i === 0} vtName={interactive ? PHOTO_VT : undefined} />
        <div className="absolute inset-x-4 top-3 flex gap-1" aria-hidden>
          {l.photos.map((_, n) => (
            <span key={n} className={`h-1 flex-1 rounded-full ${n === i ? "bg-white" : "bg-white/45"}`} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent" />
        {l.furnished && (
          <span className="absolute left-3 top-8 inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-medium text-amber-950">
            <Sofa className="size-3.5" /> Furnished
          </span>
        )}
        {!preview && <SaveButton id={l.id} className="absolute right-3 top-8" />}
        {insight?.tone === "great" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Great price
          </span>
        )}
      </div>
      <div className="shrink-0 space-y-1.5 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="tabular text-2xl font-semibold tracking-tight text-brand">
            {fmtMoney(l.rent)}
            <span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-sm text-muted-foreground">{fmtRange(l.startDate, l.endDate)}</p>
        </div>
        <p className="flex items-center justify-between gap-2 text-[15px] font-medium">
          <span className="truncate">{l.title}</span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", HOOD_STYLE[l.neighborhood])}>{l.neighborhood}</span>
          {fmtMiles(l.distanceMiles)} to campus
        </p>
      </div>
    </div>
  );
}
