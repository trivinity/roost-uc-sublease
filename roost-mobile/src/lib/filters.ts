// AUTO-COPIED from uc-sublease/lib/filters.ts by `npm run sync`. Edit the web version, not this file.
import type { Filters, Listing, Neighborhood } from "./types";

export const NEIGHBORHOODS: Neighborhood[] = ["Uptown", "Clifton", "Corryville", "Over-the-Rhine"];
export const RENT_MIN = 300;
export const RENT_MAX = 2000;
export const DISTANCE_MAX = 3;

// Upcoming co-op terms. Edit freely; these only drive the filter presets.
export const TERMS = [
  { id: "spring", label: "Spring", hint: "Jan 4 – Apr 30", from: "2027-01-04", to: "2027-04-30" },
  { id: "summer", label: "Summer", hint: "May 3 – Aug 13", from: "2027-05-03", to: "2027-08-13" },
  { id: "fall", label: "Fall", hint: "Aug 16 – Dec 17", from: "2027-08-16", to: "2027-12-17" },
] as const;

export const DEFAULT_FILTERS: Filters = {
  minRent: RENT_MIN,
  maxRent: RENT_MAX,
  from: "",
  to: "",
  neighborhoods: [],
  bedrooms: null,
  furnishedOnly: false,
  maxDistance: DISTANCE_MAX,
};

export function activeFilterCount(f: Filters): number {
  return [
    f.minRent > RENT_MIN || f.maxRent < RENT_MAX,
    f.from !== "" || f.to !== "",
    f.neighborhoods.length > 0,
    f.bedrooms !== null,
    f.furnishedOnly,
    f.maxDistance < DISTANCE_MAX,
  ].filter(Boolean).length;
}

// A listing matches a date range when it covers the whole range (ISO strings compare lexicographically).
export function filterListings(listings: Listing[], f: Filters): Listing[] {
  return listings.filter((l) => {
    if (l.rent < f.minRent || l.rent > f.maxRent) return false;
    if (f.from && l.startDate > f.from) return false;
    if (f.to && l.endDate < f.to) return false;
    if (f.neighborhoods.length && !f.neighborhoods.includes(l.neighborhood)) return false;
    if (f.bedrooms !== null && (f.bedrooms >= 4 ? l.bedrooms < 4 : l.bedrooms !== f.bedrooms)) return false;
    if (f.furnishedOnly && !l.furnished) return false;
    if (f.maxDistance < DISTANCE_MAX && l.distanceMiles > f.maxDistance) return false;
    return true;
  });
}
