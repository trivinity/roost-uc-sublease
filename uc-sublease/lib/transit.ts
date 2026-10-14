import { haversineMiles } from "./geo";

// SAMPLE STOP DATA. Locations are approximate placeholders so the feature works end to end.
// Replace the two arrays below with the real UC shuttle stops (TripShot routes change every year)
// and the Cincinnati Metro bus stops (published as GTFS). Nothing else needs to change.
export interface Stop {
  name: string;
  lat: number;
  lng: number;
  routes?: string; // optional, e.g. "Blue, Gold"
}

export const SHUTTLE_STOPS: Stop[] = [
  { name: "Tangeman University Center", lat: 39.1316, lng: -84.517 },
  { name: "Campus Recreation Center", lat: 39.1282, lng: -84.5163 },
  { name: "Nippert Stadium", lat: 39.1311, lng: -84.5092 },
  { name: "Clifton Court Hall", lat: 39.1372, lng: -84.5198 },
  { name: "Medical Campus (Eden Ave)", lat: 39.1394, lng: -84.4999 },
  { name: "Calhoun Street", lat: 39.1303, lng: -84.5186 },
];

export const BUS_STOPS: Stop[] = [
  { name: "Clifton Ave & Ludlow Ave", lat: 39.1409, lng: -84.5207 },
  { name: "Calhoun St & Jefferson Ave", lat: 39.1318, lng: -84.5127 },
  { name: "Vine St & Martin Luther King Dr", lat: 39.1349, lng: -84.5104 },
  { name: "Vine St & 14th St", lat: 39.1122, lng: -84.5152 },
  { name: "Central Pkwy & Race St", lat: 39.1098, lng: -84.5166 },
  { name: "Montgomery Rd & Smith Rd (Norwood)", lat: 39.1583, lng: -84.4542 },
  { name: "Hamilton Ave & Blue Rock St (Northside)", lat: 39.1741, lng: -84.5435 },
  { name: "Madison Rd & Erie Ave (Oakley)", lat: 39.1553, lng: -84.4412 },
  { name: "Kenwood Rd & Cooper Rd (Blue Ash)", lat: 39.2278, lng: -84.3822 },
];

export interface NearestStop {
  stop: Stop;
  miles: number;
}

export function nearestStop(stops: Stop[], at: { lat: number; lng: number }): NearestStop | null {
  let best: NearestStop | null = null;
  for (const stop of stops) {
    const miles = haversineMiles(at, stop);
    if (!best || miles < best.miles) best = { stop, miles };
  }
  return best;
}

// Anything farther than this is not worth showing as "nearby".
export const NEARBY_MAX_MILES = 1.5;
