"use client";

import Link from "next/link";
import { PawPrint, Users } from "lucide-react";
import { matchFit, TRAITS } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MatchBadge } from "./match-badge";

// Who lives there and how well they fit what you want. Whole units have no roommates.
export function RoommateFit({ listing: l }: { listing: Listing }) {
  const { prefs } = useStore();
  const home = l.household;

  if (!home) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 text-sm">
        <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
          <Users className="size-[18px]" />
        </span>
        <p>
          <span className="font-medium">Whole unit.</span> <span className="text-muted-foreground">No roommates to match with.</span>
        </p>
      </div>
    );
  }

  const fit = prefs ? matchFit(prefs, home) : null;
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Roommates</p>
          <p className="text-xs text-muted-foreground">
            {home.roommates} other {home.roommates === 1 ? "person lives" : "people live"} here
          </p>
        </div>
        {fit && <MatchBadge score={fit.score} />}
      </div>

      {fit?.dealbreakers.length ? (
        <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300">Not a fit for you: {fit.dealbreakers.join(", ").toLowerCase()}.</p>
      ) : null}

      <ul className="space-y-3">
        {TRAITS.map((t) => {
          const theirs = home[t.id];
          const part = fit?.parts.find((p) => p.trait.id === t.id);
          const diff = part ? Math.abs(part.want - theirs) : 0;
          return (
            <li key={t.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{t.label}</span>
                <span className="font-medium">{t.levels[theirs - 1]}</span>
              </div>
              <div className="flex gap-1">
                {t.levels.map((_, i) => (
                  <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < theirs ? "bg-foreground/70" : "bg-muted")} />
                ))}
              </div>
              {part && (
                <p className={cn("text-xs", diff === 0 ? "text-emerald-600 dark:text-emerald-400" : diff === 1 ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400")}>
                  You want: {t.levels[part.want - 1]}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-muted px-2.5 py-1">{home.smokeFree ? "Smoke-free" : "Smoking allowed"}</span>
        {home.cat && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <PawPrint className="size-3" /> Cat
          </span>
        )}
        {home.dog && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <PawPrint className="size-3" /> Dog
          </span>
        )}
      </div>

      {!prefs && (
        <Link href="/preferences" className="block rounded-2xl bg-primary/10 px-3 py-2.5 text-sm font-medium text-brand">
          Set your roommate preferences to see how well this fits →
        </Link>
      )}
    </div>
  );
}
