"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  bedroomLabel,
  feeShares,
  fmtMiles,
  fmtMoney,
  fmtMoney0,
  fmtRange,
  freshness,
  monthsBetween,
  TRANSFER_SHORT,
  UNIT_LABEL,
} from "@/lib/format";
import { matchFit } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Photo } from "./photo";

const total = (l: Listing) =>
  l.rent + (l.utilitiesIncluded ? 0 : l.utilitiesEstimate);

interface Row {
  label: string;
  value: (l: Listing) => ReactNode;
  // returns the numeric value where lower is better; the winners get highlighted
  best?: (l: Listing) => number;
}

const ROWS: Row[] = [
  {
    label: "Rent",
    value: (l) => `${fmtMoney(l.rent)}/mo`,
    best: (l) => l.rent,
  },
  {
    label: "Utilities",
    value: (l) =>
      l.utilitiesIncluded ? "Included" : `~${fmtMoney(l.utilitiesEstimate)}/mo`,
  },
  {
    label: "Est. total",
    value: (l) => `${fmtMoney(total(l))}/mo`,
    best: total,
  },
  {
    label: "Your sublet fee",
    value: (l) =>
      l.subletFee > 0
        ? fmtMoney0(feeShares(l.subletFee, l.feeSplitPct).subletter)
        : "None",
    best: (l) => feeShares(l.subletFee, l.feeSplitPct).subletter,
  },
  { label: "Dates", value: (l) => fmtRange(l.startDate, l.endDate, true) },
  {
    label: "Length",
    value: (l) => `${monthsBetween(l.startDate, l.endDate)} months`,
  },
  { label: "Area", value: (l) => l.neighborhood },
  {
    label: "From UC",
    value: (l) => fmtMiles(l.distanceMiles),
    best: (l) => l.distanceMiles,
  },
  {
    label: "Unit",
    value: (l) => `${UNIT_LABEL[l.unitType]} · ${bedroomLabel(l.bedrooms)}`,
  },
  { label: "Furnished", value: (l) => (l.furnished ? "Yes" : "No") },
  { label: "Lease transfer", value: (l) => TRANSFER_SHORT[l.transferType] },
  {
    label: "Landlord consent",
    value: (l) => (l.landlordConsent ? "Confirmed" : "Not confirmed"),
  },
  { label: "Availability", value: (l) => freshness(l.confirmedDaysAgo).label },
];

export function CompareTable({ listings }: { listings: Listing[] }) {
  const { prefs } = useStore();
  // roommate fit only shows once the student has set preferences
  const fitRow: Row[] = prefs
    ? [
        {
          label: "Roommate fit",
          value: (l) => {
            const f = matchFit(prefs, l.household);
            return f ? `${f.score}% match` : "No roommates";
          },
        },
      ]
    : [];
  const rows = [...ROWS.slice(0, 5), ...fitRow, ...ROWS.slice(5)];
  const cols = `7.5rem repeat(${listings.length}, minmax(10.5rem, 1fr))`;
  const labelCell =
    "sticky left-0 z-10 bg-background py-3 pr-3 text-sm text-muted-foreground";

  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div
        className="grid min-w-max gap-x-4 md:min-w-0"
        style={{ gridTemplateColumns: cols }}
      >
        <div className={labelCell} />
        {listings.map((l) => (
          <div key={l.id} className="space-y-2 pb-3">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <Photo listing={l} className="size-full" />
            </div>
            <p className="line-clamp-2 text-sm font-medium">{l.title}</p>
          </div>
        ))}

        {rows.map((row) => {
          const scores = row.best ? listings.map(row.best) : [];
          const min = scores.length ? Math.min(...scores) : 0;
          const hasTie = scores.length > 0 && scores.every((s) => s === min);
          return (
            <div key={row.label} className="contents">
              <div className={cn(labelCell, "border-t border-border")}>
                {row.label}
              </div>
              {listings.map((l, i) => {
                const winner = row.best && !hasTie && scores[i] === min;
                return (
                  <div
                    key={l.id}
                    className={cn(
                      "border-t border-border py-3 text-sm",
                      winner &&
                        "font-semibold text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {row.value(l)}
                  </div>
                );
              })}
            </div>
          );
        })}

        <div className={cn(labelCell, "border-t border-border")} />
        {listings.map((l) => (
          <div key={l.id} className="border-t border-border py-3">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/listing/${l.id}`} />}
              nativeButton={false}
            >
              View listing
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
