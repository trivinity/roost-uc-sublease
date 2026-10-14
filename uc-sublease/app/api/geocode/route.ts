import { NextRequest, NextResponse } from "next/server";

// Turns a typed address into coordinates using OpenStreetMap's free Nominatim search (no API key).
// Nominatim asks for a descriptive User-Agent and at most 1 request per second, so this runs on the server
// and caches answers for a day. Swap the URL for Mapbox or Google later if you want address autocomplete.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 4) return NextResponse.json({ results: [] });

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
    countrycodes: "us",
    viewbox: "-85.4,39.6,-83.6,38.6", // Greater Cincinnati, used to rank nearby matches first
    bounded: "0",
  }).toString();

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "RoostUCSubleaseDemo/1.0 (university capstone project)", "Accept-Language": "en" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return NextResponse.json({ results: [], error: "lookup_failed" });
    const rows = (await res.json()) as {
      lat: string;
      lon: string;
      display_name: string;
      address?: Record<string, string>;
    }[];
    const results = rows.map((r) => {
      const a = r.address ?? {};
      const street = [a.house_number, a.road].filter(Boolean).join(" ");
      const place = a.city || a.town || a.village || a.hamlet || a.county || "";
      return {
        label: [street || r.display_name.split(",")[0], place, a.state].filter(Boolean).join(", "),
        area: a.neighbourhood || a.suburb || a.city_district || place,
        lat: Number(r.lat),
        lng: Number(r.lon),
      };
    });
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "lookup_failed" });
  }
}
