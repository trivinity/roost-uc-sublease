// AUTO-COPIED from uc-sublease/lib/ranking.ts by `npm run sync`. Edit the web version, not this file.
import { MATCH_MIN, matchFit, WHOLE_UNIT_RANK, type Fit } from "./roommates";
import type { Listing, Prefs } from "./types";

export interface Ranked {
  listings: Listing[]; // best fit first, with poor fits removed unless showAll
  hidden: number; // how many poor fits were left out
  fits: Record<string, Fit | null>; // roommate fit per listing id (null for whole units)
}

// Ranks by how well each home fits the student's roommate preferences, not by how recently it was posted.
// Without preferences the order is untouched. Poor fits (and dealbreakers) are hidden until "Show all".
export function rankByFit(listings: Listing[], prefs: Prefs | null, showAll: boolean): Ranked {
  const fits: Record<string, Fit | null> = {};
  for (const l of listings) fits[l.id] = prefs ? matchFit(prefs, l.household) : null;
  if (!prefs) return { listings, hidden: 0, fits };

  const rank = (l: Listing) => fits[l.id]?.score ?? WHOLE_UNIT_RANK;
  const sorted = [...listings].sort((a, b) => rank(b) - rank(a));
  const kept = showAll ? sorted : sorted.filter((l) => (fits[l.id]?.score ?? 100) >= MATCH_MIN);
  return { listings: kept, hidden: sorted.length - kept.length, fits };
}
