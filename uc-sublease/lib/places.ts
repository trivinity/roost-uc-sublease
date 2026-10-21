import { getSupabase } from "./supabase/client";

// A property company or student apartment community from our quick-pick list (name is our label; only the Place ID is Google data).
export interface PropertyGroup {
  id: string; // Google Place ID
  name: string;
  kind: "company" | "community";
}

export interface Company {
  id: string; // Google Place ID
  name: string;
  address: string;
}

export interface GoogleRating {
  name: string;
  rating: number | null;
  count: number;
  url: string | null;
}

async function authedGet<T>(path: string): Promise<T | null> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
  return res.ok ? ((await res.json()) as T) : null;
}

export async function searchCompanies(q: string): Promise<Company[]> {
  const data = await authedGet<{ results: Company[] }>(`/api/places/search?q=${encodeURIComponent(q)}`);
  return data?.results ?? [];
}

export async function fetchPropertyGroups(): Promise<PropertyGroup[]> {
  const { data } = await getSupabase().from("property_groups").select("name, kind, google_place_id, sort").order("sort");
  return (data ?? []).map((g) => ({ id: g.google_place_id, name: g.name, kind: g.kind as PropertyGroup["kind"] }));
}

export const fetchRating = (placeId: string) => authedGet<GoogleRating>(`/api/places/rating?id=${encodeURIComponent(placeId)}`);
