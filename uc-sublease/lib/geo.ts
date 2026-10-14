// UC main campus (around McMicken Commons). Every listing's distance is measured from here.
export const UC_CENTER = { lat: 39.1329, lng: -84.515 };

const EARTH_MILES = 3958.8;
const rad = (d: number) => (d * Math.PI) / 180;

// Straight-line ("as the crow flies") distance between two points, in miles.
export function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MILES * Math.asin(Math.sqrt(h));
}

export const milesFromUC = (lat: number, lng: number): number => Math.round(haversineMiles(UC_CENTER, { lat, lng }) * 10) / 10;

// About 20 minutes per mile at a relaxed walking pace.
export const walkMinutes = (miles: number): number => Math.max(1, Math.round(miles * 20));
