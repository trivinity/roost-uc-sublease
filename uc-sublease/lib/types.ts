export type Neighborhood = "Clifton" | "Uptown" | "Corryville" | "Over-the-Rhine";
export type UnitType = "room" | "whole";
export type TransferType = "sublease" | "assignment" | "relet";

export interface Sublessor {
  id: string;
  name: string;
  detail: string; // e.g. "Mechanical Eng · 4th year"
}

export interface Listing {
  id: string;
  title: string;
  address: string;
  neighborhood: Neighborhood;
  rent: number; // per month
  utilitiesIncluded: boolean;
  utilitiesEstimate: number; // per month, 0 if included
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  bedrooms: number; // 0 = studio
  furnished: boolean;
  unitType: UnitType;
  transferType: TransferType;
  distanceMiles: number;
  description: string;
  amenities: string[];
  landlordConsent: boolean;
  confirmedDaysAgo: number;
  photos: string[]; // image paths under /public
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
  neighborhoods: Neighborhood[]; // empty = all
  bedrooms: number | null; // null = any, 4 = "4+"
  furnishedOnly: boolean;
  maxDistance: number; // miles, >= DISTANCE_MAX means any
}
