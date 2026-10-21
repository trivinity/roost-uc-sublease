import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { allow } from "@/lib/server/rate-limit";

// Finds a property management company on Google Maps so a listing can show its rating.
// The key stays on the server. Only signed-in students can call this, and answers are never stored.
const UC = { latitude: 39.1329, longitude: -84.515 };

export async function GET(req: NextRequest) {
  const uid = await requireUser(req);
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3 || q.length > 80) return NextResponse.json({ results: [] });
  if (!allow(`search:${uid}`, 20, 60_000)) return NextResponse.json({ error: "slow_down" }, { status: 429 });

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
      },
      body: JSON.stringify({
        textQuery: q,
        maxResultCount: 5,
        // rank businesses near campus first
        locationBias: { circle: { center: UC, radius: 25000 } },
      }),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
    const data = (await res.json()) as { places?: { id: string; displayName?: { text: string }; formattedAddress?: string }[] };
    const results = (data.places ?? []).map((p) => ({ id: p.id, name: p.displayName?.text ?? "", address: p.formattedAddress ?? "" }));
    return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
  }
}
