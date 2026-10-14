import type { Listing } from "./types";

export interface PriceInsight {
  pct: number; // positive = cheaper than comparable listings
  label: string;
  tone: "great" | "fair" | "high";
}

// Compares rent with similar listings (same unit type, and a similar distance from UC when there are enough of them).
export function priceInsight(l: Listing, all: Listing[]): PriceInsight | null {
  const sameType = all.filter((x) => x.id !== l.id && x.unitType === l.unitType);
  const nearby = sameType.filter((x) => Math.abs(x.distanceMiles - l.distanceMiles) <= 1.5);
  const pool = nearby.length >= 2 ? nearby : sameType;
  if (pool.length < 2) return null;

  const avg = pool.reduce((sum, x) => sum + x.rent, 0) / pool.length;
  const pct = Math.round(((avg - l.rent) / avg) * 100);
  const what = l.unitType === "room" ? "rooms" : "units";
  const where = pool === nearby ? " at a similar distance" : " nearby";

  if (pct >= 10) return { pct, tone: "great", label: `${pct}% below the average for ${what}${where}` };
  if (pct <= -10) return { pct, tone: "high", label: `${Math.abs(pct)}% above the average for ${what}${where}` };
  return { pct, tone: "fair", label: `Close to the average for ${what}${where}` };
}
