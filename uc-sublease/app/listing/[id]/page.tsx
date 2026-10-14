"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Link2,
  MessageCircle,
} from "lucide-react";
import { Credits } from "@/components/app-shell";
import { AmenityIcons } from "@/components/amenity-icons";
import { AreaPill } from "@/components/area-pill";
import { GettingAround } from "@/components/getting-around";
import { RoommateFit } from "@/components/roommate-fit";
import { Freshness } from "@/components/pill";
import { ReportButton } from "@/components/report-dialog";
import { Photo } from "@/components/photo";
import { Button } from "@/components/ui/button";
import {
  bedroomLabel,
  fmtMiles,
  fmtMoney,
  fmtRange,
  freshness,
  feeSummary,
  monthsBetween,
  TRANSFER_LABEL,
  UNIT_LABEL,
} from "@/lib/format";
import { priceInsight } from "@/lib/insights";
import { PHOTO_VT, withPhotoTransition } from "@/lib/transition";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/copy";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    ready,
    listings,
    getListing,
    shortlist,
    toggleSave,
    startChat,
    sendMessage,
    showToast,
  } = useStore();
  const gallery = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  const l = getListing(id);
  if (!ready) return null;
  if (!l) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-medium">{COPY.empty.notFound.title}</p>
        <p className="pt-1 text-sm text-muted-foreground">
          {COPY.empty.notFound.body}
        </p>
        <Button
          className="mt-4"
          render={<Link href="/list" />}
          nativeButton={false}
        >
          Back to browse
        </Button>
      </div>
    );
  }

  const f = freshness(l.confirmedDaysAgo);
  const insight = priceInsight(l, listings);
  const saved = shortlist.includes(l.id);
  const mine = l.sublessor.id === "me";
  const street = l.address.replace(/^\d+\s/, "");

  const scrollTo = (dir: 1 | -1) => {
    const el = gallery.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const message = () => router.push(`/messages/${startChat(l.id)}`);
  const askAvailable = () => {
    const tid = startChat(l.id);
    sendMessage(tid, "Hi! Is this still available?");
    router.push(`/messages/${tid}`);
  };

  const fields: [string, string][] = [
    ["Rent", `${fmtMoney(l.rent)}/mo`],
    [
      "Utilities",
      l.utilitiesIncluded
        ? "Included in rent"
        : `About ${fmtMoney(l.utilitiesEstimate)}/mo extra`,
    ],
    ["Dates", fmtRange(l.startDate, l.endDate, true)],
    ["Length", `${monthsBetween(l.startDate, l.endDate)} months`],
    ["Unit", `${UNIT_LABEL[l.unitType]} · ${bedroomLabel(l.bedrooms)} in unit`],
    ["Furnished", l.furnished ? "Yes" : "No"],
    ["Lease transfer", TRANSFER_LABEL[l.transferType]],
    ["Location", `${street}, ${l.neighborhood}`],
    ["From UC", `${fmtMiles(l.distanceMiles)} straight-line from campus`],
    ["Sublet fee", feeSummary(l.subletFee, l.feeSplitPct)],
    [
      "Landlord consent",
      l.landlordConsent
        ? "Sublessor confirms their lease allows this"
        : "Not confirmed",
    ],
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 md:px-6 md:pb-6">
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => withPhotoTransition(() => router.back())}
          className="-ml-3"
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard
              ?.writeText(window.location.href)
              .catch(() => {});
            showToast(COPY.toast.linkCopied);
          }}
        >
          <Link2 className="size-4" /> Share
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-3xl">
        <div
          ref={gallery}
          onScroll={(e) =>
            setSlide(
              Math.round(
                e.currentTarget.scrollLeft / e.currentTarget.clientWidth,
              ),
            )
          }
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {l.photos.map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] min-w-full snap-center md:aspect-[16/10]"
            >
              <Photo
                listing={l}
                index={i}
                className="size-full"
                priority={i === 0}
                vtName={i === 0 ? PHOTO_VT : undefined}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {l.photos.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full bg-white/60 transition-all",
                i === slide && "w-4 bg-white",
              )}
            />
          ))}
        </div>
        <div className="absolute inset-y-0 left-2 hidden items-center md:flex">
          <button
            onClick={() => scrollTo(-1)}
            aria-label="Previous photo"
            className="grid size-9 place-items-center rounded-full bg-white/90 text-neutral-900 shadow"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-2 hidden items-center md:flex">
          <button
            onClick={() => scrollTo(1)}
            aria-label="Next photo"
            className="grid size-9 place-items-center rounded-full bg-white/90 text-neutral-900 shadow"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
      <p className="pt-2 text-center text-xs text-muted-foreground">
        Demo photos from Unsplash. They are not these actual units.
      </p>

      <div className="space-y-1 pt-4">
        <p className="text-3xl font-semibold tracking-tight">
          {fmtMoney(l.rent)}
          <span className="text-lg font-normal text-muted-foreground">/mo</span>
        </p>
        <h1 className="text-lg font-medium">{l.title}</h1>
        <div className="pt-1">
          <AreaPill area={l.neighborhood} miles={l.distanceMiles} />
        </div>
        {insight && (
          <p
            className={cn(
              "mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
              insight.tone === "great" &&
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
              insight.tone === "fair" && "bg-muted text-muted-foreground",
              insight.tone === "high" &&
                "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300",
            )}
          >
            {insight.label}
          </p>
        )}
      </div>

      {/* "Still available?" freshness */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
        <div>
          <p className="text-sm font-medium">Still available?</p>
          <Freshness {...f} />
        </div>
        {!mine && (
          <Button variant="outline" size="sm" onClick={askAvailable}>
            Ask
          </Button>
        )}
      </div>

      <div className="mt-4 hidden gap-3 md:flex">
        {mine ? (
          <Button
            size="lg"
            className="flex-1"
            render={<Link href="/mine" />}
            nativeButton={false}
          >
            Manage listing
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={message}>
            <MessageCircle className="size-5" /> Message
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          onClick={() => toggleSave(l.id)}
          aria-pressed={saved}
        >
          <Bookmark className={cn("size-5", saved && "fill-current")} />{" "}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>

      {/* Phones: a sticky action bar keeps the main action under your thumb. */}
      <div className="fixed inset-x-0 bottom-16 z-20 flex items-center gap-3 border-t border-border/70 bg-background/80 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 md:hidden">
        <div className="min-w-0 flex-1">
          <p className="tabular text-lg font-semibold leading-tight tracking-tight text-brand">
            {fmtMoney(l.rent)}
            <span className="text-sm font-normal text-muted-foreground">
              /mo
            </span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {fmtRange(l.startDate, l.endDate)}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon-lg"
          className="size-12"
          onClick={() => toggleSave(l.id)}
          aria-pressed={saved}
          aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
        >
          <Bookmark
            className={cn("size-5", saved && "fill-primary text-primary")}
          />
        </Button>
        {mine ? (
          <Button size="lg" render={<Link href="/mine" />} nativeButton={false}>
            Manage
          </Button>
        ) : (
          <Button size="lg" onClick={message}>
            <MessageCircle className="size-5" /> Message
          </Button>
        )}
      </div>

      <p className="pt-6 text-[15px] leading-relaxed text-foreground/90">
        {l.description}
      </p>

      <dl className="mt-6 divide-y divide-border rounded-3xl border border-border px-5">
        {fields.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-3 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <AmenityIcons ids={l.amenities} />
      </div>

      <div className="mt-6 space-y-4">
        <GettingAround listing={l} />
        <RoommateFit listing={l} />
        {l.propertyReviews && (
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 text-sm">
            <div>
              <p className="font-semibold">{l.propertyReviews.group}</p>
              <p className="text-xs text-muted-foreground">
                Property group · reviews are from Google
              </p>
            </div>
            <p className="shrink-0 font-medium">
              ★ {l.propertyReviews.rating.toFixed(1)}{" "}
              <span className="font-normal text-muted-foreground">
                ({l.propertyReviews.count} Google reviews)
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-3xl border border-border p-4">
        <div className="grid size-11 place-items-center rounded-full bg-primary text-white">
          {l.sublessor.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{l.sublessor.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {l.sublessor.detail}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <BadgeCheck className="size-4" /> UC verified
        </span>
      </div>
      <p className="pt-2 text-xs text-muted-foreground">
        Contact info stays hidden until you both choose to share it in chat.
      </p>

      <div className="flex justify-center pt-4">
        <ReportButton listingId={l.id} />
      </div>
      <Credits />
    </div>
  );
}
