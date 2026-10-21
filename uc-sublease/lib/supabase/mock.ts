// A tiny in-memory stand-in for the Supabase client, used ONLY for local UI testing (NEXT_PUBLIC_MOCK_BACKEND=1).
// It lets every signed-in screen run without a real account or email. It is never enabled in production builds.
import { LISTINGS } from "../listings";
import { DEFAULT_PREFS } from "../roommates";
import type { Database } from "./database.types";
import type { Supabase } from "./client";

type Tables = Database["public"]["Tables"];
type Row = Record<string, unknown> & { id?: unknown };

const UID = "00000000-0000-0000-0000-0000000000aa";
const EMAIL = "tester@mail.uc.edu";
const SESSION_KEY = "roost-mock-session";
const uuid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

function seed() {
  const listings: Row[] = LISTINGS.map((l) => ({
    id: l.id, owner_id: null, is_sample: true, title: l.title, address: l.address, area: l.neighborhood, lat: l.lat, lng: l.lng, rent: l.rent,
    utilities_included: l.utilitiesIncluded, utilities_estimate: l.utilitiesEstimate, start_date: l.startDate, end_date: l.endDate, bedrooms: l.bedrooms,
    furnished: l.furnished, unit_type: l.unitType, transfer_type: l.transferType, description: l.description, amenities: l.amenities, sublet_fee: l.subletFee,
    fee_split_pct: l.feeSplitPct, household: l.household ?? null, property_reviews: l.propertyReviews ?? null, landlord_consent: true, photos: l.photos,
    thumbs: [], host_name: l.sublessor.name, host_detail: l.sublessor.detail, google_place_id: null, status: "active", confirmed_at: daysAgo(l.confirmedDaysAgo), created_at: daysAgo(20),
  }));
  // two of the tester's own listings, so "My listings" has something in it
  const mine = (id: string, title: string, rent: number, place: string | null, confirmed: number): Row => ({
    ...listings[0], id, owner_id: UID, is_sample: false, title, rent, google_place_id: place, host_name: "Tester", host_detail: "UC verified", confirmed_at: daysAgo(confirmed), created_at: daysAgo(confirmed),
    photos: ["/photos/living-1.jpg", "/photos/bedroom-3.jpg"], property_reviews: null, household: null,
  });
  listings.unshift(mine("mine-2", "Loft near the Rec Center (mine)", 840, null, 12), mine("mine-1", "Sunny room on Ludlow (mine)", 620, "ChIJ3beaPumzQYgR0Hia1Wwy5pY", 1));
  return {
    // onboarded + preferences set, so a reload goes straight to the app (add ?fresh=1 to the sign-in URL flow by clearing localStorage to see onboarding)
    profiles: [{ id: UID, email: EMAIL, display_name: "Tester", prefs: DEFAULT_PREFS, prefs_asked: true, onboarded: true, created_at: daysAgo(30) }] as unknown as Row[],
    listings,
    shortlist: [{ user_id: UID, listing_id: "l6", created_at: nowIso() }] as Row[],
    threads: [
      { id: "t-1", listing_id: "l6", listing_title: "Quiet furnished one-bedroom in Clifton", seeker_id: UID, host_id: null, seeker_name: "Tester", host_name: "Noah B.", seeker_shared: false, host_shared: false, seeker_read_at: daysAgo(2), host_read_at: daysAgo(2), created_at: daysAgo(3) },
      { id: "t-2", listing_id: "mine-1", listing_title: "Sunny room on Ludlow (mine)", seeker_id: "00000000-0000-0000-0000-0000000000bb", host_id: UID, seeker_name: "Riley Chen", host_name: "Tester", seeker_shared: true, host_shared: false, seeker_read_at: daysAgo(1), host_read_at: daysAgo(3), created_at: daysAgo(1) },
    ] as Row[],
    messages: [
      { id: 1, thread_id: "t-1", sender_id: UID, kind: "user", body: "Hi Noah! Is the Whitfield one-bedroom still open for summer?", created_at: daysAgo(3) },
      { id: 2, thread_id: "t-1", sender_id: null, kind: "sample_host", body: "Hey! Yes it is. Want to set up a video tour this week?", created_at: daysAgo(3) },
      { id: 3, thread_id: "t-2", sender_id: "00000000-0000-0000-0000-0000000000bb", kind: "user", body: "Hi! Is your Ludlow room still available for spring?", created_at: daysAgo(1) },
      { id: 4, thread_id: "t-2", sender_id: null, kind: "system", body: "Riley Chen shared their contact info.", created_at: daysAgo(1) },
    ] as Row[],
    reports: [] as Row[],
    property_groups: [
      ["Gaslight Property", "company", "ChIJP3LeqIezQYgRs8U5H0Yrlxo"], ["Uptown Rental Properties", "company", "ChIJMSFbuZWzQYgRcHJxNzFJDVk"], ["ES Properties", "company", "ChIJt8czi3a0QYgR6--Os4lUNNc"],
      ["Premier City Properties", "company", "ChIJ3beaPumzQYgR0Hia1Wwy5pY"], ["The Verge", "community", "ChIJ3UMBQfOzQYgRIjyy3L6q53s"], ["University Edge", "community", "ChIJRbOo9o-zQYgRf60oENVCpjY"],
    ].map(([name, kind, g], i) => ({ id: uuid(), name, kind, google_place_id: g, sort: i * 10 })) as Row[],
  };
}

type Db = ReturnType<typeof seed>;
type Listener = (payload: { eventType: string; new: Row; old: Row }) => void;

export function createMockSupabase(): Supabase {
  const db: Db = seed();
  let nextMsg = 100;
  const blobs = new Map<string, string>(); // uploaded photo path -> local object URL, so new listings show their pictures
  const authListeners = new Set<(e: string, s: unknown) => void>();
  const channels: { table: string; event: string; cb: Listener }[] = [];
  const session = () => ({ access_token: "mock-token", user: { id: UID, email: EMAIL } });
  const signedIn = () => typeof window !== "undefined" && window.localStorage.getItem(SESSION_KEY) === "1";
  const emit = (table: string, eventType: string, row: Row) => channels.filter((c) => c.table === table && (c.event === "*" || c.event === eventType)).forEach((c) => c.cb({ eventType, new: row, old: {} }));

  const table = (name: keyof Db) => db[name] as Row[];

  // the database's insert triggers, replayed here
  function beforeInsert(name: string, row: Row): Row {
    const r: Row = { created_at: nowIso(), ...row };
    if (name === "listings") {
      const local = (list: unknown) => (Array.isArray(list) ? list.map((p) => blobs.get(String(p)) ?? p) : []);
      Object.assign(r, { id: r.id ?? uuid(), host_name: "Tester", host_detail: "UC verified", confirmed_at: nowIso(), status: "active", is_sample: false, photos: local(r.photos), thumbs: local(r.thumbs), property_reviews: null });
    }
    if (name === "threads") {
      const l = table("listings").find((x) => x.id === r.listing_id);
      Object.assign(r, { id: uuid(), host_id: l?.owner_id ?? null, host_name: l?.host_name, listing_title: l?.title, seeker_name: "Tester", seeker_shared: false, host_shared: false, seeker_read_at: nowIso(), host_read_at: nowIso() });
    }
    if (name === "messages") Object.assign(r, { id: nextMsg++, kind: "user" });
    return r;
  }

  function afterInsert(name: string, row: Row) {
    if (name === "messages") {
      emit("messages", "INSERT", row);
      const t = table("threads").find((x) => x.id === row.thread_id);
      if (t && t.host_id === null) {
        setTimeout(() => {
          const reply: Row = { id: nextMsg++, thread_id: row.thread_id, sender_id: null, kind: "sample_host", body: "Sounds good! When are you free to tour?", created_at: nowIso() };
          table("messages").push(reply);
          emit("messages", "INSERT", reply);
        }, 1200);
      }
    }
  }

  class Query {
    private op: "select" | "insert" | "update" | "delete" = "select";
    private filters: [string, unknown][] = [];
    private values: Row | Row[] | null = null;
    private orders: [string, boolean][] = [];
    private refOrder = true;
    private cols = "*";
    private mode: "many" | "one" | "maybe" = "many";
    private returning = false;
    private max = Infinity;
    constructor(private name: keyof Db) {}
    select(cols = "*") { if (this.op === "select") this.cols = cols; else { this.returning = true; this.cols = cols; } return this; }
    insert(v: Row | Row[]) { this.op = "insert"; this.values = v; return this; }
    update(v: Row) { this.op = "update"; this.values = v; return this; }
    delete() { this.op = "delete"; return this; }
    eq(c: string, v: unknown) { this.filters.push([c, v]); return this; }
    order(c: string, o?: { ascending?: boolean; referencedTable?: string }) { if (o?.referencedTable) this.refOrder = o.ascending !== false; else this.orders.push([c, o?.ascending !== false]); return this; }
    limit(n: number) { this.max = n; return this; }
    single() { this.mode = "one"; return this; }
    maybeSingle() { this.mode = "maybe"; return this; }
    then<T>(res: (v: { data: unknown; error: unknown }) => T, rej?: (e: unknown) => T) { return Promise.resolve(this.run()).then(res, rej); }

    private shape(rows: Row[]): Row[] {
      return rows.map((r) => {
        if (this.cols.includes("messages(*)")) {
          const msgs = table("messages").filter((m) => m.thread_id === r.id).sort((a, b) => (Date.parse(String(a.created_at)) - Date.parse(String(b.created_at))) * (this.refOrder ? 1 : -1));
          return { ...r, messages: msgs };
        }
        return r;
      });
    }

    private run(): { data: unknown; error: unknown } {
      const rows = table(this.name);
      const match = (r: Row) => this.filters.every(([c, v]) => r[c] === v);
      let out: Row[] = [];
      if (this.op === "insert") {
        const incoming = Array.isArray(this.values) ? this.values : [this.values as Row];
        for (const v of incoming) {
          if (this.name === "threads" && rows.some((t) => t.listing_id === v.listing_id && t.seeker_id === v.seeker_id)) return { data: null, error: { code: "23505", message: "duplicate" } };
          const r = beforeInsert(this.name, v);
          rows.push(r);
          out.push(r);
          afterInsert(this.name, r);
        }
      } else if (this.op === "update") {
        out = rows.filter(match);
        out.forEach((r) => Object.assign(r, this.values));
      } else if (this.op === "delete") {
        const keep = rows.filter((r) => !match(r));
        rows.length = 0;
        rows.push(...keep);
      } else {
        out = rows.filter(match);
        for (const [c, asc] of [...this.orders].reverse()) out.sort((a, b) => (String(a[c]) < String(b[c]) ? -1 : String(a[c]) > String(b[c]) ? 1 : 0) * (asc ? 1 : -1));
        out = out.slice(0, this.max);
      }
      if (this.op !== "select" && !this.returning) return { data: null, error: null };
      const shaped = this.shape(out);
      if (this.mode === "one") return shaped[0] ? { data: shaped[0], error: null } : { data: null, error: { message: "no rows" } };
      if (this.mode === "maybe") return { data: shaped[0] ?? null, error: null };
      return { data: shaped, error: null };
    }
  }

  const rpc = async (fn: string, args: { p_thread: string }) => {
    const t = table("threads").find((x) => x.id === args.p_thread);
    if (!t) return { data: null, error: { message: "not found" } };
    if (fn === "get_contact") {
      const iAmSeeker = t.seeker_id === UID;
      const shared = iAmSeeker ? t.host_shared : t.seeker_shared;
      if (!shared) return { data: null, error: null };
      return { data: iAmSeeker ? `${String(t.host_name).split(" ")[0].toLowerCase()}@mail.uc.edu (sample listing)` : "riley.chen@mail.uc.edu", error: null };
    }
    if (fn === "share_contact") {
      const mine = t.seeker_id === UID ? "seeker_shared" : "host_shared";
      t[mine] = true;
      const sys = (body: string) => { const m: Row = { id: nextMsg++, thread_id: t.id, sender_id: null, kind: "system", body, created_at: nowIso() }; table("messages").push(m); emit("messages", "INSERT", m); };
      sys("Tester shared their contact info.");
      if (t.host_id === null) { t.host_shared = true; sys(`${t.host_name} shared their contact info too.`); }
      return { data: null, error: null };
    }
    if (fn === "mark_thread_read") { t[t.seeker_id === UID ? "seeker_read_at" : "host_read_at"] = nowIso(); return { data: null, error: null }; }
    return { data: null, error: null };
  };

  const client = {
    auth: {
      getSession: async () => ({ data: { session: signedIn() ? session() : null }, error: null }),
      onAuthStateChange: (cb: (e: string, s: unknown) => void) => {
        authListeners.add(cb);
        setTimeout(() => cb("INITIAL_SESSION", signedIn() ? session() : null), 0);
        return { data: { subscription: { unsubscribe: () => authListeners.delete(cb) } } };
      },
      signInWithOtp: async ({ email }: { email: string }) =>
        /@(mail\.)?uc\.edu$/i.test(email) ? { data: {}, error: null } : { data: {}, error: { name: "AuthRetryableFetchError", status: 500, message: "Database error saving new user" } },
      verifyOtp: async ({ token }: { token: string }) => {
        if (token !== "123456") return { data: {}, error: { name: "AuthApiError", status: 403, message: "Token has expired or is invalid" } };
        window.localStorage.setItem(SESSION_KEY, "1");
        authListeners.forEach((cb) => cb("SIGNED_IN", session()));
        return { data: { session: session() }, error: null };
      },
      signOut: async () => {
        window.localStorage.removeItem(SESSION_KEY);
        authListeners.forEach((cb) => cb("SIGNED_OUT", null));
        return { error: null };
      },
    },
    from: (name: keyof Tables) => new Query(name as keyof Db),
    rpc,
    channel: () => {
      const ch = {
        on: (_type: string, filter: { event: string; table: string }, cb: Listener) => { channels.push({ table: filter.table, event: filter.event, cb }); return ch; },
        subscribe: () => ch,
      };
      return ch;
    },
    removeChannel: async () => "ok",
    storage: {
      from: () => ({
        upload: async (path: string, blob: Blob) => {
          blobs.set(path, URL.createObjectURL(blob));
          return { data: {}, error: null };
        },
        remove: async () => ({ data: [], error: null }),
      }),
    },
  };
  return client as unknown as Supabase;
}
