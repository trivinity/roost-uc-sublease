import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);
export const SUPABASE_URL = url ?? "";

export type Supabase = SupabaseClient<Database>;

let client: Supabase | null = null;

// One shared browser client. The publishable key is public by design; row level security decides what each signed-in student can touch.
export function getSupabase(): Supabase {
  if (!url || !key) throw new Error("Supabase isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  client ??= createClient<Database>(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}
