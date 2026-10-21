import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { allow } from "@/lib/server/rate-limit";

// Live Google star rating for a stored Place ID. Google's terms only let us keep the Place ID, so the rating is
// fetched when someone views a listing and never saved or cached (hence no-store).
export async function GET(req: NextRequest) {
  const uid = await requireUser(req);
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  if (!allow(`rating:${uid}`, 60, 60_000)) return NextResponse.json({ error: "slow_down" }, { status: 429 });

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${id}`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri" },
      cache: "no-store",
    });
    if (res.status === 404) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!res.ok) return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
    const p = (await res.json()) as { displayName?: { text: string }; rating?: number; userRatingCount?: number; googleMapsUri?: string };
    return NextResponse.json(
      { name: p.displayName?.text ?? "", rating: p.rating ?? null, count: p.userRatingCount ?? 0, url: p.googleMapsUri ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
  }
}
