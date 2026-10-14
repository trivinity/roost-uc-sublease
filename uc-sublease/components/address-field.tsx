"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { milesFromUC } from "@/lib/geo";
import { fmtMiles } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface Place {
  label: string;
  area: string;
  lat: number;
  lng: number;
}

// If the lookup can't find an address, the student can pick the nearest area instead (approximate centers).
const AREAS: Place[] = [
  { label: "Uptown", area: "Uptown", lat: 39.1315, lng: -84.5175 },
  { label: "Clifton", area: "Clifton", lat: 39.1412, lng: -84.5215 },
  { label: "Corryville", area: "Corryville", lat: 39.1345, lng: -84.5105 },
  { label: "Over-the-Rhine", area: "Over-the-Rhine", lat: 39.1125, lng: -84.5148 },
  { label: "Northside", area: "Northside", lat: 39.1745, lng: -84.544 },
  { label: "Norwood", area: "Norwood", lat: 39.159, lng: -84.454 },
  { label: "Oakley", area: "Oakley", lat: 39.1517, lng: -84.4351 },
];

// Type an address, pick a match, and we store its coordinates. Distance is always measured from UC.
export function AddressField({ value, place, onChange, error }: { value: string; place: Place | null; onChange: (text: string, place: Place | null) => void; error?: string }) {
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const seq = useRef(0);

  // look up as they type (waits 600 ms after the last key so we stay polite to the free service)
  useEffect(() => {
    if (place || value.trim().length < 5) return;
    const mine = ++seq.current;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
        const data = (await res.json()) as { results: Place[]; error?: string };
        if (mine !== seq.current) return;
        setResults(data.results);
        setFailed(!!data.error || data.results.length === 0);
        setOpen(true);
      } catch {
        if (mine === seq.current) setFailed(true);
      } finally {
        if (mine === seq.current) setLoading(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [value, place]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          className={cn("h-12 w-full rounded-2xl border border-border bg-background px-4 pr-11 text-base outline-none focus:border-primary aria-invalid:border-destructive")}
          aria-invalid={!!error}
          value={value}
          onChange={(e) => onChange(e.target.value, null)}
          onFocus={() => setOpen(true)}
          placeholder="Start typing the street address"
          autoComplete="off"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{loading ? <Loader2 className="size-4 animate-spin" /> : place ? <Check className="size-4 text-emerald-600" /> : <MapPin className="size-4" />}</span>

        {open && !place && value.trim().length >= 5 && results.length > 0 && (
          <ul className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
            {results.map((r) => (
              <li key={`${r.lat},${r.lng}`}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    onChange(r.label, r);
                    setOpen(false);
                  }}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    {r.label}
                    <span className="block text-xs text-muted-foreground">{fmtMiles(milesFromUC(r.lat, r.lng))} from UC</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {place && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
          <Check className="size-4" /> {fmtMiles(milesFromUC(place.lat, place.lng))} from UC (straight line) · {place.area}
        </p>
      )}
      {error && !place && <p className="text-sm text-destructive">{error}</p>}

      {!place && failed && !loading && value.trim().length >= 5 && (
        <div className="space-y-2 rounded-2xl bg-muted p-3">
          <p className="text-sm text-muted-foreground">We couldn&apos;t find that address. Add the city and ZIP, or pick the nearest area (distance will be approximate):</p>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <button key={a.area} type="button" onClick={() => onChange(value, a)} className="rounded-full border border-border bg-background px-3 py-1 text-sm hover:border-primary">
                {a.area}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
