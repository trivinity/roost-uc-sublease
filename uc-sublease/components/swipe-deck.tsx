"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Bookmark, MessageCircle, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RIGHT_SWIPE_ACTION } from "@/lib/config";
import { DEFAULT_FILTERS, filterListings } from "@/lib/filters";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { withPhotoTransition } from "@/lib/transition";
import { haptic } from "@/lib/utils";
import { rankByFit } from "@/lib/ranking";
import { FilterButton } from "./filter-button";
import { FitToggle } from "./fit-toggle";
import { DeckDetails } from "./deck-details";
import { ListingCard } from "./listing-card";
import { COPY } from "@/lib/copy";

const RIGHT_LABEL = RIGHT_SWIPE_ACTION === "message" ? "Message" : "Save";
const RightIcon = RIGHT_SWIPE_ACTION === "message" ? MessageCircle : Bookmark;

export function SwipeDeck() {
  const router = useRouter();
  const {
    listings,
    filters,
    setFilters,
    seen,
    markSeen,
    unmarkSeen,
    resetDeck,
    shortlist,
    save,
    unsave,
    startChat,
    prefs,
    showAll,
    setShowAll,
  } = useStore();
  const [history, setHistory] = useState<{ id: string; saved: boolean }[]>([]);
  const [busy, setBusy] = useState(false);

  // Best roommate fit first (not newest first). Poor fits are hidden until "Show all".
  const ranked = useMemo(
    () =>
      rankByFit(
        filterListings(listings, filters).filter(
          (l) => l.sublessor.id !== "me",
        ),
        prefs,
        showAll,
      ),
    [listings, filters, prefs, showAll],
  );
  const matches = ranked.listings;
  const queue = useMemo(
    () => matches.filter((l) => !seen.includes(l.id)),
    [matches, seen],
  );
  const top: Listing | undefined = queue[0];
  const next: Listing | undefined = queue[1];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-10, 10]);
  const rightStamp = useTransform(x, [20, 120], [0, 1]);
  const leftStamp = useTransform(x, [-120, -20], [1, 0]);
  const nextScale = useTransform(x, [-220, 0, 220], [1, 0.94, 1]);

  const commit = useCallback(
    (dir: 1 | -1, l: Listing) => {
      markSeen(l.id);
      haptic();
      if (dir === -1) {
        setHistory((h) => [...h, { id: l.id, saved: false }]);
      } else if (RIGHT_SWIPE_ACTION === "message") {
        router.push(`/messages/${startChat(l.id)}`);
      } else {
        const wasSaved = shortlist.includes(l.id);
        save(l.id);
        setHistory((h) => [...h, { id: l.id, saved: !wasSaved }]);
      }
    },
    [markSeen, router, startChat, shortlist, save],
  );

  const fling = useCallback(
    async (dir: 1 | -1) => {
      if (!top || busy) return;
      setBusy(true);
      await animate(x, dir * 700, { duration: 0.22, ease: "easeIn" });
      commit(dir, top);
      x.set(0);
      setBusy(false);
    },
    [top, busy, x, commit],
  );

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    unmarkSeen(last.id);
    if (last.saved) unsave(last.id);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        fling(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        fling(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fling]);

  return (
    <div className="bg-gradient-to-b from-rose-100/70 via-orange-50/40 to-transparent dark:from-primary/10 dark:via-primary/[0.03]">
      <div className="mx-auto h-[calc(100dvh-3.5rem-4rem)] w-full max-w-md px-4 pb-4 pt-3 md:h-[calc(100dvh-3.5rem)] md:max-w-xl lg:grid lg:max-w-5xl lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:gap-12 lg:px-8">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between pb-3">
            <p className="text-sm text-muted-foreground">
              {top
                ? `${queue.length} ${queue.length === 1 ? "place" : "places"} to go`
                : "Discover"}
            </p>
            <FilterButton />
          </div>
          <FitToggle hidden={ranked.hidden} className="mb-3 self-start" />

          <div className="relative min-h-0 flex-1">
            {top ? (
              <>
                {next && (
                  <motion.div
                    key={next.id}
                    style={{ scale: nextScale }}
                    className="pointer-events-none absolute inset-0"
                  >
                    <ListingCard listing={next} />
                  </motion.div>
                )}
                <motion.div
                  key={top.id}
                  style={{ x, rotate }}
                  drag="x"
                  dragMomentum={false}
                  dragElastic={0.9}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 110 || info.velocity.x > 600) fling(1);
                    else if (info.offset.x < -110 || info.velocity.x < -600)
                      fling(-1);
                    else
                      animate(x, 0, {
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      });
                  }}
                  onTap={(_, info) => {
                    // Photo taps and buttons are handled by the card itself; only the text area opens details.
                    const hit = document.elementFromPoint(
                      info.point.x - window.scrollX,
                      info.point.y - window.scrollY,
                    );
                    if (hit?.closest("button, [data-photo]")) return;
                    withPhotoTransition(() =>
                      router.push(`/listing/${top.id}`),
                    );
                  }}
                  className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
                >
                  <ListingCard listing={top} interactive />
                  <motion.span
                    style={{ opacity: rightStamp }}
                    className="pointer-events-none absolute left-5 top-1/4 -rotate-6 rounded-xl border-2 border-emerald-500 bg-white/80 px-3 py-1 text-lg font-semibold uppercase tracking-wide text-emerald-600 dark:bg-black/60 dark:text-emerald-400"
                  >
                    {RIGHT_LABEL}
                  </motion.span>
                  <motion.span
                    style={{ opacity: leftStamp }}
                    className="pointer-events-none absolute right-5 top-1/4 rotate-6 rounded-xl border-2 border-neutral-400 bg-white/80 px-3 py-1 text-lg font-semibold uppercase tracking-wide text-neutral-600 dark:bg-black/60 dark:text-neutral-300"
                  >
                    Pass
                  </motion.span>
                </motion.div>
              </>
            ) : (
              <EmptyState
                hasMatches={matches.length > 0}
                hiddenByFit={ranked.hidden}
                onShowAll={() => setShowAll(true)}
                onResetDeck={() => {
                  resetDeck();
                  setHistory([]);
                }}
                onResetFilters={() => setFilters(DEFAULT_FILTERS)}
              />
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="icon-lg"
              className="size-12"
              onClick={undo}
              disabled={history.length === 0}
              aria-label="Undo last swipe"
            >
              <Undo2 className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => fling(-1)}
              disabled={!top || busy}
            >
              <X className="size-5" /> Pass
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => fling(1)}
              disabled={!top || busy}
            >
              <RightIcon className="size-5" /> {RIGHT_LABEL}
            </Button>
          </div>
          {seen.length === 0 && top ? (
            <p className="pt-3 text-center text-xs text-muted-foreground">
              Swipe right to {RIGHT_LABEL.toLowerCase()}, left to pass · Tap the
              photo for more pictures
            </p>
          ) : (
            <p className="hidden pt-3 text-center text-xs text-muted-foreground md:block">
              Swipe or use the ← → arrow keys
            </p>
          )}
        </div>
        {top && <DeckDetails listing={top} />}
      </div>
    </div>
  );
}

function EmptyState({
  hasMatches,
  hiddenByFit,
  onShowAll,
  onResetDeck,
  onResetFilters,
}: {
  hasMatches: boolean;
  hiddenByFit: number;
  onShowAll: () => void;
  onResetDeck: () => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-border px-8 text-center">
      <p className="text-lg font-semibold tracking-tight">
        {hasMatches
          ? COPY.empty.deckDone.title
          : hiddenByFit > 0
            ? COPY.empty.weakFits.title
            : COPY.empty.noMatches.title}
      </p>
      <p className="text-sm text-muted-foreground">
        {hasMatches
          ? COPY.empty.deckDone.body
          : hiddenByFit > 0
            ? COPY.empty.weakFits.body(hiddenByFit)
            : COPY.empty.noMatches.body}
      </p>
      <div className="flex gap-2">
        {hasMatches ? (
          <>
            <Button onClick={onResetDeck}>Start over</Button>
            <Button
              variant="outline"
              render={<Link href="/list" />}
              nativeButton={false}
            >
              Browse list
            </Button>
          </>
        ) : hiddenByFit > 0 ? (
          <Button onClick={onShowAll}>Show all</Button>
        ) : (
          <Button onClick={onResetFilters}>Clear filters</Button>
        )}
      </div>
    </div>
  );
}
