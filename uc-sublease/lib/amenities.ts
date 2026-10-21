import type { AmenityId } from "./types";

// Amenities show as small icons with a hover/tap label. The icon for each id is chosen in the UI.
export const AMENITY_LABEL: Record<AmenityId, string> = {
  laundry: "Laundry",
  wifi: "Wi-Fi",
  bed: "Furnished bedroom",
  parking: "Parking",
  utilities: "Utilities included",
  elevator: "Elevator",
  security: "Secure entry",
  gym: "Gym",
  dishwasher: "Dishwasher",
  ac: "Air conditioning",
  bike: "Bike storage",
  rooftop: "Rooftop deck",
  outdoor: "Porch or yard",
  pets: "Pet friendly",
  kitchen: "Large kitchen",
};

// Shown first in the icon row when a listing is furnished (it replaces the old "Furnished" text tag).
export const FURNISHED_LABEL = "Furnished";

export const AMENITY_IDS = Object.keys(AMENITY_LABEL) as AmenityId[];
