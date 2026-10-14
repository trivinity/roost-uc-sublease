// AUTO-COPIED from uc-sublease/lib/roommates.ts by `npm run sync`. Edit the web version, not this file.
import type { Household, Prefs, Traits } from "./types";

// Roommate questions are rating scales and checkboxes only (no free text), and only about lifestyle.
export interface TraitDef {
  id: keyof Traits;
  label: string;
  question: string;
  levels: string[]; // one label per step on the scale
}

export const TRAITS: TraitDef[] = [
  { id: "cleanliness", label: "Cleanliness", question: "How tidy is the home?", levels: ["Very relaxed", "Relaxed", "Average", "Tidy", "Spotless"] },
  { id: "noise", label: "Noise", question: "How loud is the home?", levels: ["Library quiet", "Quiet", "Average", "Lively", "Loud"] },
  { id: "social", label: "Hanging out at home", question: "How often is there a get-together at home?", levels: ["Rarely", "Sometimes", "Often", "Always something going on"] },
  { id: "guests", label: "Overnight guests", question: "How often do guests stay over?", levels: ["Never", "Rarely", "Sometimes", "Often"] },
  { id: "sleep", label: "Sleep schedule", question: "When does the home sleep?", levels: ["Early bird", "Morning person", "In between", "Evening person", "Night owl"] },
  { id: "approachability", label: "Approachability", question: "How easy is it to chat or bring up a problem?", levels: ["Keep to themselves", "Reserved", "Friendly", "Easy to talk to", "Everyone's friend"] },
];

export const DEFAULT_TRAITS: Traits = { cleanliness: 3, noise: 3, social: 2, guests: 2, sleep: 3, approachability: 3 };

export const DEFAULT_PREFS: Prefs = {
  want: { ...DEFAULT_TRAITS },
  me: { ...DEFAULT_TRAITS },
  wantSmokeFree: true,
  okCats: true,
  okDogs: true,
  hasCat: false,
  hasDog: false,
};

export interface FitPart {
  trait: TraitDef;
  want: number;
  theirs: number;
  score: number; // 0 to 1
}

export interface Fit {
  score: number; // 0 to 100
  parts: FitPart[];
  dealbreakers: string[];
}

// How well a home fits what a student wants. Closer ratings score higher, and smoke-free and pet
// preferences are hard requirements. Returns null for whole units, which have no roommates to match.
export function matchFit(prefs: Prefs, home: Household | undefined): Fit | null {
  if (!home) return null;
  const parts: FitPart[] = TRAITS.map((trait) => {
    const want = prefs.want[trait.id];
    const theirs = home[trait.id];
    const span = trait.levels.length - 1;
    return { trait, want, theirs, score: 1 - Math.abs(want - theirs) / span };
  });
  const dealbreakers: string[] = [];
  if (prefs.wantSmokeFree && !home.smokeFree) dealbreakers.push("Smoking in the home");
  if (home.cat && !prefs.okCats) dealbreakers.push("Has a cat");
  if (home.dog && !prefs.okDogs) dealbreakers.push("Has a dog");
  // Allergies or pets the student has that the home doesn't allow are not modelled; the host can say so in chat.
  const avg = parts.reduce((n, p) => n + p.score, 0) / parts.length;
  return { score: dealbreakers.length ? 0 : Math.round(avg * 100), parts, dealbreakers };
}

// Listings below this are hidden by default (until "Show all"). Whole units are never hidden.
export const MATCH_MIN = 55;
// Whole units have no roommates, so rank them as an average fit.
export const WHOLE_UNIT_RANK = 75;

export const matchTone = (score: number): "great" | "good" | "low" => (score >= 80 ? "great" : score >= MATCH_MIN ? "good" : "low");
