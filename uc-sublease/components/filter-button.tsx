"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  DISTANCE_OPTIONS,
  filterListings,
  RENT_MAX,
  RENT_MIN,
  TERMS,
} from "@/lib/filters";
import { fmtMoney } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Filters } from "@/lib/types";
import { Chip } from "./chip";
import { Sheet } from "./sheet";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-b border-border py-5 first:pt-2 last:border-0">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function DualRange({
  low,
  high,
  onChange,
}: {
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
}) {
  const step = 25;
  const pct = (v: number) => ((v - RENT_MIN) / (RENT_MAX - RENT_MIN)) * 100;
  return (
    <div className="relative h-6">
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
        style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
      />
      <input
        type="range"
        aria-label="Minimum rent"
        className="dual-range absolute inset-0 w-full"
        min={RENT_MIN}
        max={RENT_MAX}
        step={step}
        value={low}
        onChange={(e) =>
          onChange(Math.min(Number(e.target.value), high - step), high)
        }
      />
      <input
        type="range"
        aria-label="Maximum rent"
        className="dual-range absolute inset-0 w-full"
        min={RENT_MIN}
        max={RENT_MAX}
        step={step}
        value={high}
        onChange={(e) =>
          onChange(low, Math.max(Number(e.target.value), low + step))
        }
      />
    </div>
  );
}

const BEDROOMS: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "Studio", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

// One filter state (in the store) feeds both the deck and the list; this is the only UI that edits it.
export function FilterButton() {
  const { filters, setFilters, listings } = useStore();
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(filters);
  const matches = filterListings(listings, filters).length;
  const patch = (p: Partial<Filters>) => setFilters({ ...filters, ...p });

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Open filters"
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {count > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">
            {count}
          </span>
        )}
      </Button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Filters"
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              disabled={count === 0}
            >
              Reset
            </Button>
            <Button size="lg" className="flex-1" onClick={() => setOpen(false)}>
              Show {matches} {matches === 1 ? "place" : "places"}
            </Button>
          </div>
        }
      >
        <Section title="Distance from UC" hint="Straight-line miles">
          <div className="flex flex-wrap gap-2">
            {DISTANCE_OPTIONS.map((o) => (
              <Chip
                key={o.miles}
                active={filters.maxDistance === o.miles}
                onClick={() => patch({ maxDistance: o.miles })}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section
          title="Monthly rent"
          hint={`${fmtMoney(filters.minRent)} – ${fmtMoney(filters.maxRent)}${filters.maxRent >= RENT_MAX ? "+" : ""}`}
        >
          <DualRange
            low={filters.minRent}
            high={filters.maxRent}
            onChange={(minRent, maxRent) => patch({ minRent, maxRent })}
          />
        </Section>

        <Section title="Available dates" hint="Covers your whole stay">
          <div className="flex flex-wrap gap-2">
            {TERMS.map((t) => {
              const active = filters.from === t.from && filters.to === t.to;
              return (
                <Chip
                  key={t.id}
                  active={active}
                  onClick={() =>
                    patch(
                      active
                        ? { from: "", to: "" }
                        : { from: t.from, to: t.to },
                    )
                  }
                >
                  {t.label}
                  <span
                    className={
                      active
                        ? "ml-1.5 text-white/70"
                        : "ml-1.5 text-muted-foreground"
                    }
                  >
                    {t.hint}
                  </span>
                </Chip>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs text-muted-foreground">
              Move in
              <input
                type="date"
                value={filters.from}
                onChange={(e) => patch({ from: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              Move out
              <input
                type="date"
                value={filters.to}
                onChange={(e) => patch({ to: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              />
            </label>
          </div>
        </Section>

        <Section title="Bedrooms in unit">
          <div className="flex flex-wrap gap-2">
            {BEDROOMS.map((b) => (
              <Chip
                key={b.label}
                active={filters.bedrooms === b.value}
                onClick={() => patch({ bedrooms: b.value })}
              >
                {b.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Furnished">
          <label className="flex cursor-pointer items-center justify-between text-sm">
            Furnished only
            <input
              type="checkbox"
              role="switch"
              checked={filters.furnishedOnly}
              onChange={(e) => patch({ furnishedOnly: e.target.checked })}
              className="relative h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-300 dark:bg-neutral-600 transition-colors before:absolute before:left-0.5 before:top-0.5 before:size-6 before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-primary dark:checked:bg-primary checked:before:translate-x-5"
            />
          </label>
        </Section>
      </Sheet>
    </>
  );
}
