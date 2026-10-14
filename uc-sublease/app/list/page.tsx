"use client";

import { useMemo, useState } from "react";
import { Credits } from "@/components/app-shell";
import { FilterButton } from "@/components/filter-button";
import { ListingRow } from "@/components/listing-row";
import { Button } from "@/components/ui/button";
import { DEFAULT_FILTERS, filterListings } from "@/lib/filters";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { COPY } from "@/lib/copy";

type Sort = "match" | "cheapest" | "priciest" | "closest" | "fresh";
const SORTS: { value: Sort; label: string }[] = [
  { value: "match", label: "Recommended" },
  { value: "cheapest", label: "Price: low to high" },
  { value: "priciest", label: "Price: high to low" },
  { value: "closest", label: "Closest to campus" },
  { value: "fresh", label: "Recently confirmed" },
];

export default function ListPage() {
  const { listings, filters, setFilters } = useStore();
  const [sort, setSort] = useState<Sort>("match");
  const results = useMemo(() => {
    const out = filterListings(listings, filters);
    const by: Record<Sort, (a: Listing, b: Listing) => number> = {
      match: () => 0,
      cheapest: (a, b) => a.rent - b.rent,
      priciest: (a, b) => b.rent - a.rent,
      closest: (a, b) => a.distanceMiles - b.distanceMiles,
      fresh: (a, b) => a.confirmedDaysAgo - b.confirmedDaysAgo,
    };
    return [...out].sort(by[sort]);
  }, [listings, filters, sort]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6 md:px-6">
      <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Browse</h1>
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "place" : "places"} near campus
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Sort listings"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-10 min-w-0 flex-1 rounded-full border border-border bg-background px-3 text-sm outline-none focus:border-primary sm:flex-none"
          >
            {SORTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <FilterButton />
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">{COPY.empty.noMatches.title}</p>
          <p className="text-sm text-muted-foreground">{COPY.empty.noMatches.body}</p>
          <Button onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {results.map((l, i) => (
            <div
              key={l.id}
              className="h-full min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-fill-mode:backwards]"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <ListingRow listing={l} mine={l.sublessor.id === "me"} />
            </div>
          ))}
        </div>
      )}
      <Credits />
    </div>
  );
}
