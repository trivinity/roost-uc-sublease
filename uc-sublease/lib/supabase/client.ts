import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Local UI testing only: `NEXT_PUBLIC_MOCK_BACKEND=1 npm run dev` swaps in an in-memory fake (see mock.ts). Not set in production.
export const mockBackend = process.env.NEXT_PUBLIC_MOCK_BACKEND === "1";
export const supabaseConfigured = mockBackend || Boolean(url && key);
export const SUPABASE_URL = url ?? "";

export type Supabase = SupabaseClient<Database>;

let client: Supabase | null = null;

// One shared browser client. The publishable key is public by design; row level security decides what each signed-in student can touch.
export function getSupabase(): Supabase {
  if (process.env.NEXT_PUBLIC_MOCK_BACKEND === "1") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded only for local UI testing, so it stays out of production bundles
    const { createMockSupabase } = require("mock-backend") as typeof import("./mock");
    return (client ??= createMockSupabase());
  }
  if (!url || !key) throw new Error("Supabase isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  client ??= createClient<Database>(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}
