"use client";

import { useMemo, useState } from "react";
import { Credits } from "@/components/app-shell";
import { FilterButton } from "@/components/filter-button";
import { ListingRow } from "@/components/listing-row";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { List, Map as MapIcon } from "lucide-react";
import { FitToggle } from "@/components/fit-toggle";
import { DEFAULT_FILTERS, DISTANCE_ANY, filterListings } from "@/lib/filters";
import { rankByFit } from "@/lib/ranking";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { COPY } from "@/lib/copy";

type Sort = "match" | "cheapest" | "priciest" | "closest" | "fresh";
// The map needs the browser (it measures the screen), so it is loaded on the client only.
const ListingsMap = dynamic(
  () => import("@/components/listings-map").then((m) => m.ListingsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] animate-pulse rounded-3xl bg-muted" />
    ),
  },
);

const SORTS: { value: Sort; label: string }[] = [
  { value: "match", label: "Best fit" },
  { value: "cheapest", label: "Price: low to high" },
  { value: "priciest", label: "Price: high to low" },
  { value: "closest", label: "Closest to campus" },
  { value: "fresh", label: "Recently confirmed" },
];

export default function ListPage() {
  const { listings, filters, setFilters, prefs, showAll, setShowAll } =
    useStore();
  const [sort, setSort] = useState<Sort>("match");
  const [view, setView] = useState<"list" | "map">("list");

  const ranked = useMemo(
    () => rankByFit(filterListings(listings, filters), prefs, showAll),
    [listings, filters, prefs, showAll],
  );
  const results = useMemo(() => {
    // "Best fit" keeps the ranking; the other sorts reorder the same set of listings.
    const by: Record<Sort, (a: Listing, b: Listing) => number> = {
      match: () => 0,
      cheapest: (a, b) => a.rent - b.rent,
      priciest: (a, b) => b.rent - a.rent,
      closest: (a, b) => a.distanceMiles - b.distanceMiles,
      fresh: (a, b) => a.confirmedDaysAgo - b.confirmedDaysAgo,
    };
    return [...ranked.listings].sort(by[sort]);
  }, [ranked, sort]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6 md:px-6">
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Browse</h1>
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "place" : "places"}
            {filters.maxDistance < DISTANCE_ANY
              ? ` within ${filters.maxDistance} mi of UC`
              : " near UC"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="View"
            className="flex rounded-full border border-border bg-card p-1"
          >
            {(["list", "map"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {v === "list" ? (
                  <List className="size-4" />
                ) : (
                  <MapIcon className="size-4" />
                )}
                {v === "list" ? "List" : "Map"}
              </button>
            ))}
          </div>
          <FilterButton />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <FitToggle hidden={ranked.hidden} />
        <select
          aria-label="Sort listings"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-10 min-w-0 rounded-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          {SORTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.value === "match" && !prefs ? "Recommended" : o.label}
            </option>
          ))}
        </select>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">
            {ranked.hidden > 0
              ? COPY.empty.weakFits.title
              : COPY.empty.noMatches.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {ranked.hidden > 0
              ? COPY.empty.weakFits.body(ranked.hidden)
              : COPY.empty.noMatches.body}
          </p>
          {ranked.hidden > 0 ? (
            <Button onClick={() => setShowAll(true)}>Show all</Button>
          ) : (
            <Button onClick={() => setFilters(DEFAULT_FILTERS)}>
              Clear filters
            </Button>
          )}
        </div>
      ) : view === "map" ? (
        <ListingsMap listings={results} maxDistance={filters.maxDistance} />
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
