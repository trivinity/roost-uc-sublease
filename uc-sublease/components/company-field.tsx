"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Check, Loader2, X } from "lucide-react";
import { searchCompanies, type Company } from "@/lib/places";

// Optional: find the property management company on Google Maps so students see its star rating.
// Only the Place ID is saved; the rating itself is looked up live whenever someone views the listing.
export function CompanyField({ value, onChange }: { value: Company | null; onChange: (c: Company | null) => void }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (value || text.trim().length < 3) return;
    const mine = ++seq.current;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchCompanies(text.trim());
        if (mine !== seq.current) return;
        setResults(found);
        setSearched(true);
      } finally {
        if (mine === seq.current) setLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [text, value]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm">
        <p className="flex min-w-0 items-center gap-2">
          <Check className="size-4 shrink-0 text-emerald-600" />
          <span className="min-w-0">
            <span className="block truncate font-medium">{value.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{value.address}</span>
          </span>
        </p>
        <button
          type="button"
          aria-label="Remove property company"
          onClick={() => {
            onChange(null);
            setText("");
            setResults([]);
            setSearched(false);
          }}
          className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        className="h-12 w-full rounded-2xl border border-border bg-background px-4 pr-11 text-base outline-none focus:border-primary"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSearched(false);
        }}
        placeholder="Search the company on Google Maps"
        autoComplete="off"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Building2 className="size-4" />}
      </span>
      {text.trim().length >= 3 && results.length > 0 && (
        <ul className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
          {results.map((r) => (
            <li key={r.id}>
              <button type="button" className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm hover:bg-muted" onClick={() => onChange(r)}>
                <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate">{r.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.address}</span>
                </span>
              </button>
            </li>
          ))}
          <li className="border-t border-border px-4 py-1.5 text-[11px] text-muted-foreground">Google Maps</li>
        </ul>
      )}
      {searched && !loading && results.length === 0 && <p className="pt-1.5 text-xs text-muted-foreground">No match on Google Maps. You can leave this blank.</p>}
    </div>
  );
}
