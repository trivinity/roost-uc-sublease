// AUTO-COPIED from uc-sublease/lib/types.ts by `npm run sync`. Edit the web version, not this file.
// Free-form area label shown to students (e.g. "Clifton", "Norwood"). Search is by distance, not by area.
export type Area = string;
export type UnitType = "room" | "whole";
export type TransferType = "sublease" | "assignment" | "relet";

export interface Sublessor {
  id: string;
  name: string;
  detail: string; // e.g. "Mechanical Eng · 4th year"
}

export type AmenityId =
  | "laundry" | "wifi" | "bed" | "parking" | "utilities" | "elevator" | "security" | "gym"
  | "dishwasher" | "ac" | "bike" | "rooftop" | "outdoor" | "pets" | "kitchen";

// How the existing roommates describe their home (rooms only). Scales are 1 (low) to 5 (high), social and guests 1 to 4.
export interface Household {
  roommates: number; // how many other people live there
  cleanliness: number;
  noise: number;
  social: number;
  guests: number;
  sleep: number; // 1 early bird ... 5 night owl
  approachability: number;
  smokeFree: boolean;
  cat: boolean;
  dog: boolean;
}

export interface PropertyReviews {
  group: string; // property management group
  rating: number;
  count: number;
}

export interface Listing {
  id: string;
  title: string;
  address: string;
  neighborhood: Area; // display label only
  lat: number;
  lng: number;
  rent: number; // per month
  utilitiesIncluded: boolean;
  utilitiesEstimate: number; // per month, 0 if included
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  bedrooms: number; // 0 = studio
  furnished: boolean;
  unitType: UnitType;
  transferType: TransferType;
  distanceMiles: number; // straight-line miles from the UC campus center, computed from lat/lng
  description: string;
  amenities: AmenityId[];
  subletFee: number; // one-time fee the landlord charges for the sublease, 0 = none
  feeSplitPct: number; // share of that fee the subletter covers (0 to 100)
  household?: Household; // rooms only
  propertyReviews?: PropertyReviews;
  landlordConsent: boolean;
  confirmedDaysAgo: number;
  photos: string[]; // image paths under /public, or compressed data URLs for photos a student uploaded
  thumbs?: string[]; // small versions of the same photos, used in lists so they load fast
  sublessor: Sublessor;
}

export interface Message {
  id: string;
  from: "me" | "them" | "system";
  text: string;
  time: string;
}

export interface Thread {
  id: string;
  listingId: string;
  messages: Message[];
  unread: boolean;
  myContactShared: boolean;
  theirContactShared: boolean;
}

export interface User {
  email: string;
  name: string;
}

export interface Filters {
  minRent: number;
  maxRent: number;
  from: string; // ISO or ""
  to: string;
  bedrooms: number | null; // null = any, 4 = "4+"
  furnishedOnly: boolean;
  maxDistance: number; // miles from UC, >= DISTANCE_ANY means any
}

// What a student is looking for in roommates ("want") and how they describe themselves ("me").
export interface Traits {
  cleanliness: number;
  noise: number;
  social: number;
  guests: number;
  sleep: number;
  approachability: number;
}

export interface Prefs {
  want: Traits;
  me: Traits;
  wantSmokeFree: boolean;
  okCats: boolean;
  okDogs: boolean;
  hasCat: boolean;
  hasDog: boolean;
}
