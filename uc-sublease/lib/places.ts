import { getSupabase } from "./supabase/client";

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

export const fetchRating = (placeId: string) => authedGet<GoogleRating>(`/api/places/rating?id=${encodeURIComponent(placeId)}`);
