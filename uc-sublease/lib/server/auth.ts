import { createClient } from "@supabase/supabase-js";

// Checks the signed-in student's token on the server, so only Roost users can spend Google lookups.
// Returns the user id, or null when the request has no valid session.
export async function requireUser(req: Request): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  return error || !data.user ? null : data.user.id;
}
