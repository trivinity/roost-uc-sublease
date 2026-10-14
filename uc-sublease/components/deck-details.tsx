"use client";

import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bedroomLabel, fmtRange, freshness, monthsBetween, TRANSFER_SHORT, UNIT_LABEL } from "@/lib/format";
import { priceInsight } from "@/lib/insights";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Freshness } from "./pill";

// Wide screens only: the deck card is a phone-shaped column, so this panel uses the room beside it
// to show the details of whichever listing is on top.
export function DeckDetails({ listing: l }: { listing: Listing }) {
  const { listings } = useStore();
  const f = freshness(l.confirmedDaysAgo);
  const insight = priceInsight(l, listings);
  const facts: [string, string][] = [
    ["Utilities", l.utilitiesIncluded ? "Included" : `About $${l.utilitiesEstimate}/mo extra`],
    ["Length", `${monthsBetween(l.startDate, l.endDate)} months`],
    ["Unit", `${UNIT_LABEL[l.unitType]} · ${bedroomLabel(l.bedrooms)}`],
    ["Lease transfer", TRANSFER_SHORT[l.transferType]],
  ];

  return (
    <aside key={l.id} className="hidden min-h-0 animate-in fade-in overflow-y-auto pb-4 pt-12 duration-300 lg:block" aria-label="Listing details">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">{l.title}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Freshness {...f} />
            <span className="text-xs text-muted-foreground">{fmtRange(l.startDate, l.endDate, true)}</span>
          </div>
          {insight && (
            <p
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                insight.tone === "great" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
                insight.tone === "fair" && "bg-muted text-muted-foreground",
                insight.tone === "high" && "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300",
              )}
            >
              {insight.label}
            </p>
          )}
        </div>

        <p className="text-[15px] leading-relaxed text-foreground/90">{l.description}</p>

        <dl className="grid grid-cols-2 gap-3">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-border bg-card p-3.5">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="pt-0.5 text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-2">
          {l.amenities.map((a) => (
            <span key={a} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
              {a}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4">
          <div className="grid size-11 place-items-center rounded-full bg-primary text-white">{l.sublessor.name.charAt(0)}</div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{l.sublessor.name}</p>
            <p className="truncate text-sm text-muted-foreground">{l.sublessor.detail}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="size-4" /> UC verified
          </span>
        </div>

        <Button variant="outline" render={<Link href={`/listing/${l.id}`} />} nativeButton={false}>
          See full listing <ChevronRight className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
