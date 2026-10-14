import type { Neighborhood, TransferType, UnitType } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function fmtDate(iso: string, withYear = false): string {
  const { y, m, d } = parts(iso);
  return `${MONTHS[m - 1]} ${d}${withYear ? `, ${y}` : ""}`;
}

export function fmtRange(start: string, end: string, withYear = false): string {
  return `${fmtDate(start, withYear)} – ${fmtDate(end, withYear)}`;
}

export function monthsBetween(start: string, end: string): number {
  const a = parts(start);
  const b = parts(end);
  const days = (Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000;
  return Math.max(1, Math.round(days / 30.4));
}

export const fmtMoney = (n: number) => `$${n.toLocaleString("en-US")}`;
export const fmtMiles = (n: number) => `${n.toFixed(1)} mi`;

export const UNIT_LABEL: Record<UnitType, string> = { room: "Private room", whole: "Whole unit" };
export const TRANSFER_LABEL: Record<TransferType, string> = {
  sublease: "Sublease (original tenant stays on lease)",
  assignment: "Lease assignment (lease moves to you)",
  relet: "Re-let (landlord signs a new short lease)",
};
export const TRANSFER_SHORT: Record<TransferType, string> = {
  sublease: "Sublease",
  assignment: "Lease assignment",
  relet: "Re-let",
};

export function bedroomLabel(n: number): string {
  return n === 0 ? "Studio" : `${n} bd`;
}

export function freshness(days: number): { label: string; tone: "good" | "ok" | "stale" } {
  const when = days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
  if (days <= 3) return { label: `Confirmed available ${when}`, tone: "good" };
  if (days <= 10) return { label: `Confirmed available ${when}`, tone: "ok" };
  return { label: `Last confirmed ${when} — may be taken`, tone: "stale" };
}

// One soft color per neighborhood so the deck and list are easy to scan.
export const HOOD_STYLE: Record<Neighborhood, string> = {
  Uptown: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  Clifton: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  Corryville: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300",
  "Over-the-Rhine": "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
};
