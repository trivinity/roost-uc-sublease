import { milesFromUC } from "../geo";
import { DEFAULT_PREFS } from "../roommates";
import type { AmenityId, Household, Listing, Message, Prefs, PropertyReviews, Thread, TransferType, UnitType } from "../types";
import type { Database, Json } from "./database.types";
import { SUPABASE_URL } from "./client";

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type ThreadRow = Database["public"]["Tables"]["threads"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// A thread as loaded from the database: the row, its messages, and the other person's contact once they shared it.
export type ThreadData = ThreadRow & { messages: MessageRow[]; theirContact: string | null };

export const PHOTO_BUCKET = "listing-photos";

// Sample listings point at files in /public; student uploads are paths inside the storage bucket.
export function photoUrl(path: string): string {
  if (path.startsWith("/") || path.startsWith("http") || path.startsWith("data:")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

const DAY = 86_400_000;

export function toListing(r: ListingRow, userId: string | null): Listing {
  return {
    id: r.id,
    title: r.title,
    address: r.address,
    neighborhood: r.area,
    lat: r.lat,
    lng: r.lng,
    rent: r.rent,
    utilitiesIncluded: r.utilities_included,
    utilitiesEstimate: r.utilities_estimate,
    startDate: r.start_date,
    endDate: r.end_date,
    bedrooms: r.bedrooms,
    furnished: r.furnished,
    unitType: r.unit_type as UnitType,
    transferType: r.transfer_type as TransferType,
    distanceMiles: milesFromUC(r.lat, r.lng),
    description: r.description,
    amenities: r.amenities as AmenityId[],
    subletFee: r.sublet_fee,
    feeSplitPct: r.fee_split_pct,
    household: (r.household as unknown as Household | null) ?? undefined,
    propertyReviews: (r.property_reviews as unknown as PropertyReviews | null) ?? undefined,
    landlordConsent: r.landlord_consent,
    confirmedDaysAgo: Math.max(0, Math.floor((Date.now() - new Date(r.confirmed_at).getTime()) / DAY)),
    photos: r.photos.map(photoUrl),
    thumbs: r.thumbs.length ? r.thumbs.map(photoUrl) : undefined,
    // "me" marks the viewer's own listings so the UI can hide the message button and show "My listings"
    sublessor: { id: r.owner_id && r.owner_id === userId ? "me" : (r.owner_id ?? "sample"), name: r.host_name, detail: r.host_detail },
    isSample: r.is_sample,
  };
}

export function toPrefs(p: Json | null): Prefs | null {
  if (!p || typeof p !== "object" || Array.isArray(p)) return null;
  const x = p as Partial<Prefs>;
  return { ...DEFAULT_PREFS, ...x, want: { ...DEFAULT_PREFS.want, ...x.want }, me: { ...DEFAULT_PREFS.me, ...x.me } };
}

// "Now", "5m", "3h", "Yesterday", "Mon", then "Oct 12"
export function fmtWhen(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  const diff = now - t;
  if (diff < 60_000) return "Now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < DAY) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 2 * DAY) return "Yesterday";
  const d = new Date(t);
  if (diff < 7 * DAY) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function toThread(t: ThreadData, userId: string): Thread {
  const iAmSeeker = t.seeker_id === userId;
  const messages: Message[] = [...t.messages]
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.id - b.id)
    .map((m) => ({
      id: String(m.id),
      from: m.kind === "system" ? "system" : m.sender_id === userId ? "me" : "them",
      text: m.body,
      time: fmtWhen(m.created_at),
      createdAt: m.created_at,
    }));
  const readAt = iAmSeeker ? t.seeker_read_at : t.host_read_at;
  const lastIncoming = [...messages].reverse().find((m) => m.from === "them");
  return {
    id: t.id,
    listingId: t.listing_id,
    listingTitle: t.listing_title,
    otherName: iAmSeeker ? t.host_name : t.seeker_name,
    messages,
    unread: !!lastIncoming && Date.parse(lastIncoming.createdAt ?? "") > Date.parse(readAt),
    myContactShared: iAmSeeker ? t.seeker_shared : t.host_shared,
    theirContactShared: iAmSeeker ? t.host_shared : t.seeker_shared,
    theirContact: t.theirContact,
  };
}
