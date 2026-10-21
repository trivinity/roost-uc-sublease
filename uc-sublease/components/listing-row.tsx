"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/types";
import { bedroomLabel, fmtMoney, fmtRange, freshness } from "@/lib/format";
import { matchFit } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import { AmenityIcons } from "./amenity-icons";
import { AreaPill } from "./area-pill";
import { MatchBadge } from "./match-badge";
import { Freshness, Pill } from "./pill";
import { Photo } from "./photo";
import { SaveButton } from "./save-button";
import { withPhotoTransition } from "@/lib/transition";

// Phones: photo on top (roomier, easier to scan). Wider screens: compact row with a thumbnail.
export function ListingRow({ listing: l, mine }: { listing: Listing; mine?: boolean }) {
  const f = freshness(l.confirmedDaysAgo);
  const { prefs } = useStore();
  const fit = prefs ? matchFit(prefs, l.household) : null;
  const router = useRouter();
  const href = `/listing/${l.id}`;
  return (
    <Link
      href={href}
      onClick={(e) => {
        // let cmd/ctrl-click and middle-click open a new tab as usual
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        withPhotoTransition(() => router.push(href), e.currentTarget.querySelector<HTMLElement>("[data-row-photo]"));
      }}
      className="group flex h-full min-w-0 flex-col gap-3 rounded-3xl border border-border bg-card p-3 shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float sm:flex-row sm:gap-4"
    >
      <div data-row-photo className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl sm:aspect-auto sm:size-32 sm:w-32">
        <Photo listing={l} className="size-full" thumb />
        {!mine && <SaveButton id={l.id} className="absolute right-2 top-2" />}
        {fit && <MatchBadge score={fit.score} className="absolute bottom-2 left-2 shadow-sm" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 sm:py-1 sm:pl-0 sm:pr-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="tabular text-lg font-semibold tracking-tight text-brand">
            {fmtMoney(l.rent)}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-xs text-muted-foreground">{fmtRange(l.startDate, l.endDate)}</p>
        </div>
        <p className="line-clamp-2 text-sm font-medium leading-snug">{l.title}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {mine && <Pill className="bg-primary text-white">Your listing</Pill>}
          {l.isSample && <Pill className="bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900">Sample</Pill>}
          <AreaPill area={l.neighborhood} miles={l.distanceMiles} />
          <Pill>
            {l.unitType === "room" ? "Room" : "Whole unit"} · {bedroomLabel(l.bedrooms)}
          </Pill>
          {l.furnished && <Pill className="bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300">Furnished</Pill>}
        </div>
        <AmenityIcons ids={l.amenities} max={6} size="sm" interactive={false} className="gap-1.5 pt-2" />
        <div className="pt-2">
          <Freshness {...f} />
        </div>
      </div>
    </Link>
  );
}
