"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { COPY } from "./copy";
import { DEFAULT_FILTERS } from "./filters";
import type { ProcessedPhoto } from "./images";
import { getSupabase, supabaseConfigured, type Supabase } from "./supabase/client";
import type { Json } from "./supabase/database.types";
import {
  PHOTO_BUCKET,
  toListing,
  toPrefs,
  toThread,
  type ListingInsert,
  type ListingRow,
  type MessageRow,
  type ThreadData,
  type ThreadRow,
} from "./supabase/mappers";
import type { Filters, Listing, Prefs, Thread, User } from "./types";

// Shared data (listings, chats, shortlist, profile) lives in Supabase and is guarded by row level security.
// Only per-device conveniences stay in localStorage: the filters, which cards you already swiped, and "show all".
const UI_KEY = "roost-ui-v3";

interface UiState {
  filters: Filters;
  seen: string[];
  showAll: boolean;
}

// Everything loaded for the signed-in student.
interface Remote {
  uid: string;
  email: string;
  name: string;
  onboarded: boolean;
  prefs: Prefs | null;
  prefsAsked: boolean;
  listings: ListingRow[];
  shortlist: string[];
  threads: ThreadData[];
  reported: string[];
}

interface Store {
  ready: boolean;
  configured: boolean;
  loadError: string | null;
  reload: () => void;

  user: User | null;
  requestCode: (email: string) => Promise<string | null>; // resolves to an error message, or null when the code was sent
  verifyCode: (email: string, code: string) => Promise<string | null>;
  signOut: () => Promise<void>;

  listings: Listing[];
  getListing: (id: string) => Listing | undefined;
  postListing: (draft: Listing, photos: ProcessedPhoto[]) => Promise<string | null>; // resolves to the new id
  confirmListing: (id: string) => Promise<void>;
  removeListing: (id: string) => Promise<void>; // marks it as rented

  filters: Filters;
  setFilters: (f: Filters) => void;

  seen: string[];
  markSeen: (id: string) => void;
  unmarkSeen: (id: string) => void;
  resetDeck: () => void;

  shortlist: string[];
  toggleSave: (id: string) => void;
  save: (id: string) => void;
  unsave: (id: string) => void;

  threads: Thread[];
  unreadCount: number;
  startChat: (listingId: string) => Promise<string | null>; // resolves to the thread id
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markRead: (threadId: string) => void;
  shareContact: (threadId: string) => Promise<void>;

  reported: string[];
  report: (listingId: string, reason: string) => Promise<void>;

  onboarded: boolean;
  finishOnboarding: () => void;

  // roommate preferences: null until the student fills them in; prefsAsked is set once they answered or skipped
  prefs: Prefs | null;
  prefsAsked: boolean;
  savePrefs: (p: Prefs) => void;
  skipPrefs: () => void;
  showAll: boolean; // true = also show listings that are a poor roommate fit
  setShowAll: (v: boolean) => void;

  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}

const nameFromEmail = (email: string) => {
  const local = email.split("@")[0].replace(/[._-]+/g, " ");
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
};

function authMessage(e: { message: string; status?: number; code?: string; name?: string }): string {
  const m = e.message.toLowerCase();
  // the signup rule in the database rejects anyone outside UC (and the allowlist) with this message
  if (m.includes("database error saving new user")) return COPY.signin.notUc;
  if (e.name === "AuthRetryableFetchError" && !e.status) return COPY.errors.offline;
  if (e.code === "over_email_send_rate_limit" || e.code === "over_request_rate_limit" || e.status === 429) return COPY.signin.tooMany;
  if (e.code === "email_address_not_authorized") return COPY.signin.notReady;
  if (e.code === "email_address_invalid" || e.code === "validation_failed") return COPY.signin.badEmail;
  return COPY.signin.failed;
}

class PhotoError extends Error {}

async function uploadPhoto(sb: Supabase, path: string, dataUrl: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw new PhotoError(error.message);
}

// Adds a message to its chat. Drops the grey "sending" copy this device added a moment ago.
function withMessage(r: Remote, m: MessageRow, dropTemp?: number): Remote {
  return {
    ...r,
    threads: r.threads.map((t) =>
      t.id !== m.thread_id
        ? t
        : {
            ...t,
            messages: [
              ...t.messages.filter(
                (x) => x.id !== dropTemp && x.id !== m.id && !(x.id < 0 && m.id > 0 && x.sender_id === m.sender_id && x.body === m.body),
              ),
              m,
            ],
          },
    ),
  };
}

async function fetchContacts(sb: Supabase, uid: string, rows: (ThreadRow & { messages: MessageRow[] })[]): Promise<ThreadData[]> {
  return Promise.all(
    rows.map(async (t) => {
      const theirShared = t.seeker_id === uid ? t.host_shared : t.seeker_shared;
      if (!theirShared) return { ...t, theirContact: null };
      const { data } = await sb.rpc("get_contact", { p_thread: t.id });
      return { ...t, theirContact: data ?? null };
    }),
  );
}

async function fetchThreads(sb: Supabase, uid: string): Promise<ThreadData[]> {
  const { data, error } = await sb
    .from("threads")
    .select("*, messages(*)")
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "messages", ascending: true });
  if (error) throw error;
  return fetchContacts(sb, uid, data);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [remote, setRemote] = useState<Remote | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [seen, setSeen] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastRefresh = useRef(0);
  const threadsRef = useRef<ThreadData[]>([]);

  const uid = session?.user.id ?? null;
  const email = session?.user.email ?? "";

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const patch = useCallback((fn: (r: Remote) => Remote) => setRemote((r) => (r ? fn(r) : r)), []);

  // ---- who is signed in
  useEffect(() => {
    if (!supabaseConfigured) return;
    const sb = getSupabase();
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ---- per-device settings
  /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(UI_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<UiState>;
        setFilters({ ...DEFAULT_FILTERS, ...p.filters });
        setSeen(p.seen ?? []);
        setShowAll(p.showAll ?? false);
      }
    } catch {
      // ignore corrupt or unavailable storage
    }
    setUiReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!uiReady) return;
    try {
      localStorage.setItem(UI_KEY, JSON.stringify({ filters, seen, showAll } satisfies UiState));
    } catch {
      // storage full or blocked; everything still works from memory
    }
  }, [uiReady, filters, seen, showAll]);

  // ---- load everything for the signed-in student
  useEffect(() => {
    if (!uid) return;
    let alive = true;
    (async () => {
      try {
        const sb = getSupabase();
        const [profile, listings, shortlist, threads, reports] = await Promise.all([
          sb.from("profiles").select("*").eq("id", uid).single(),
          sb.from("listings").select("*").order("confirmed_at", { ascending: false }).limit(500),
          sb.from("shortlist").select("listing_id"),
          fetchThreads(sb, uid),
          sb.from("reports").select("listing_id"),
        ]);
        if (profile.error) throw profile.error;
        if (listings.error) throw listings.error;
        if (shortlist.error) throw shortlist.error;
        if (reports.error) throw reports.error;
        if (!alive) return;
        setRemote({
          uid,
          email: profile.data.email,
          name: profile.data.display_name,
          onboarded: profile.data.onboarded,
          prefs: toPrefs(profile.data.prefs),
          prefsAsked: profile.data.prefs_asked,
          listings: listings.data,
          shortlist: shortlist.data.map((s) => s.listing_id),
          threads,
          reported: reports.data.map((r) => r.listing_id),
        });
        setLoadError(null);
        lastRefresh.current = Date.now();
      } catch {
        if (alive) setLoadError(COPY.errors.load);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid, attempt]);

  const reload = useCallback(() => {
    setLoadError(null);
    setAttempt((n) => n + 1);
  }, []);

  const reloadThreads = useCallback(async () => {
    if (!uid) return;
    try {
      const threads = await fetchThreads(getSupabase(), uid);
      patch((r) => (r.uid === uid ? { ...r, threads } : r));
    } catch {
      // the next refresh will catch up
    }
  }, [uid, patch]);

  const scheduleReloadThreads = useCallback(() => {
    clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => void reloadThreads(), 400);
  }, [reloadThreads]);

  const reloadThread = useCallback(
    async (threadId: string) => {
      if (!uid) return;
      const sb = getSupabase();
      const { data } = await sb.from("threads").select("*, messages(*)").eq("id", threadId).maybeSingle();
      if (!data) return;
      const [row] = await fetchContacts(sb, uid, [data]);
      patch((r) => ({ ...r, threads: r.threads.some((t) => t.id === threadId) ? r.threads.map((t) => (t.id === threadId ? row : t)) : [row, ...r.threads] }));
    },
    [uid, patch],
  );

  // Pull fresh listings and chats when the student comes back to the tab (phones drop live connections in the background).
  useEffect(() => {
    if (!uid) return;
    const onVisible = async () => {
      if (document.visibilityState !== "visible" || Date.now() - lastRefresh.current < 30_000) return;
      lastRefresh.current = Date.now();
      const { data } = await getSupabase().from("listings").select("*").order("confirmed_at", { ascending: false }).limit(500);
      if (data) patch((r) => (r.uid === uid ? { ...r, listings: data } : r));
      void reloadThreads();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [uid, patch, reloadThreads]);

  useEffect(() => {
    threadsRef.current = remote?.threads ?? [];
  }, [remote?.threads]);

  // ---- live chat: new messages and sharing changes arrive without a refresh (Realtime respects the same row level security)
  useEffect(() => {
    if (!uid) return;
    const sb = getSupabase();
    const channel = sb
      .channel(`roost-${uid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (p) => {
        const m = p.new as MessageRow;
        if (!threadsRef.current.some((t) => t.id === m.thread_id)) scheduleReloadThreads();
        else patch((r) => withMessage(r, m));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "threads" }, (p) => {
        if (p.eventType === "DELETE") {
          const gone = (p.old as { id?: string }).id;
          if (gone) patch((r) => ({ ...r, threads: r.threads.filter((t) => t.id !== gone) }));
          return;
        }
        const row = p.new as ThreadRow;
        const known = threadsRef.current.find((t) => t.id === row.id);
        // read marks change on every visit, so only act on new chats and on sharing changes
        if (!known || known.seeker_shared !== row.seeker_shared || known.host_shared !== row.host_shared) void reloadThread(row.id);
      })
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, [uid, patch, reloadThread, scheduleReloadThreads]);

  // ---- sign in and out
  const requestCode = useCallback(async (address: string) => {
    if (!supabaseConfigured) return COPY.errors.notSetUp;
    const { error } = await getSupabase().auth.signInWithOtp({ email: address.trim().toLowerCase(), options: { shouldCreateUser: true } });
    return error ? authMessage(error) : null;
  }, []);

  const verifyCode = useCallback(async (address: string, code: string) => {
    const { error } = await getSupabase().auth.verifyOtp({ email: address.trim().toLowerCase(), token: code, type: "email" });
    if (!error) return null;
    return error.name === "AuthRetryableFetchError" && !error.status ? COPY.errors.offline : COPY.signin.wrongCode;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setRemote(null);
    setFilters(DEFAULT_FILTERS);
    setSeen([]);
    setShowAll(false);
  }, []);

  // ---- listings
  const remoteListings = remote?.listings;
  const listings = useMemo(() => (remoteListings ? remoteListings.map((r) => toListing(r, uid)) : []), [remoteListings, uid]);
  const getListing = useCallback((id: string) => listings.find((l) => l.id === id), [listings]);

  const postListing = useCallback(
    async (draft: Listing, uploads: ProcessedPhoto[]) => {
      if (!uid) return null;
      const sb = getSupabase();
      const stamp = crypto.randomUUID();
      const uploaded: string[] = [];
      try {
        const photos: string[] = [];
        const thumbs: string[] = [];
        for (const [i, u] of uploads.entries()) {
          const full = `${uid}/${stamp}-${i}.jpg`;
          const thumb = `${uid}/${stamp}-${i}-t.jpg`;
          await uploadPhoto(sb, full, u.full);
          uploaded.push(full);
          await uploadPhoto(sb, thumb, u.thumb);
          uploaded.push(thumb);
          photos.push(full);
          thumbs.push(thumb);
        }
        const row: ListingInsert = {
          owner_id: uid,
          title: draft.title,
          address: draft.address,
          area: draft.neighborhood,
          lat: draft.lat,
          lng: draft.lng,
          rent: draft.rent,
          utilities_included: draft.utilitiesIncluded,
          utilities_estimate: draft.utilitiesEstimate,
          start_date: draft.startDate,
          end_date: draft.endDate,
          bedrooms: draft.bedrooms,
          furnished: draft.furnished,
          unit_type: draft.unitType,
          transfer_type: draft.transferType,
          description: draft.description,
          amenities: draft.amenities,
          sublet_fee: draft.subletFee,
          fee_split_pct: draft.feeSplitPct,
          household: (draft.household as unknown as Json | undefined) ?? null,
          google_place_id: draft.googlePlaceId ?? null,
          landlord_consent: true,
          photos,
          thumbs,
        };
        const { data, error } = await sb.from("listings").insert(row).select().single();
        if (error) throw error;
        patch((r) => ({ ...r, listings: [data, ...r.listings] }));
        showToast(COPY.toast.posted);
        return data.id;
      } catch (e) {
        if (uploaded.length) void sb.storage.from(PHOTO_BUCKET).remove(uploaded);
        showToast(e instanceof PhotoError ? COPY.errors.photoFailed : COPY.errors.postFailed);
        return null;
      }
    },
    [uid, patch, showToast],
  );

  const confirmListing = useCallback(
    async (id: string) => {
      const at = new Date().toISOString();
      const { error } = await getSupabase().from("listings").update({ confirmed_at: at }).eq("id", id);
      if (error) return showToast(COPY.errors.generic);
      patch((r) => ({ ...r, listings: r.listings.map((l) => (l.id === id ? { ...l, confirmed_at: at } : l)) }));
      showToast(COPY.toast.confirmed);
    },
    [patch, showToast],
  );

  const removeListing = useCallback(
    async (id: string) => {
      const { error } = await getSupabase().from("listings").update({ status: "rented" }).eq("id", id);
      if (error) return showToast(COPY.errors.generic);
      patch((r) => ({ ...r, listings: r.listings.filter((l) => l.id !== id), shortlist: r.shortlist.filter((x) => x !== id) }));
      showToast(COPY.toast.rented);
    },
    [patch, showToast],
  );

  // ---- shortlist (updates instantly, then syncs; rolls back if the save fails)
  const shortlist = remote?.shortlist ?? [];
  const setSaved = useCallback(
    async (id: string, on: boolean) => {
      if (!uid) return;
      const sb = getSupabase();
      patch((r) => ({ ...r, shortlist: on ? (r.shortlist.includes(id) ? r.shortlist : [...r.shortlist, id]) : r.shortlist.filter((x) => x !== id) }));
      const { error } = on ? await sb.from("shortlist").insert({ user_id: uid, listing_id: id }) : await sb.from("shortlist").delete().eq("user_id", uid).eq("listing_id", id);
      if (error && error.code !== "23505") {
        patch((r) => ({ ...r, shortlist: on ? r.shortlist.filter((x) => x !== id) : [...r.shortlist, id] }));
        showToast(COPY.errors.generic);
      }
    },
    [uid, patch, showToast],
  );

  // ---- chats
  const remoteThreads = remote?.threads;
  const threads = useMemo(() => {
    if (!remoteThreads || !uid) return [];
    const last = (t: Thread) => Date.parse(t.messages[t.messages.length - 1]?.createdAt ?? "") || 0;
    return remoteThreads.map((t) => toThread(t, uid)).sort((a, b) => last(b) - last(a));
  }, [remoteThreads, uid]);

  const startChat = useCallback(
    async (listingId: string) => {
      if (!uid) return null;
      const existing = threadsRef.current.find((t) => t.listing_id === listingId && t.seeker_id === uid);
      if (existing) return existing.id;
      // the database fills in the names, the host and the title itself (so they can't be faked); these are placeholders
      const { data, error } = await getSupabase()
        .from("threads")
        .insert({ listing_id: listingId, seeker_id: uid, listing_title: "", seeker_name: "", host_name: "" })
        .select("*, messages(*)")
        .single();
      if (error) {
        if (error.code === "23505") {
          const { data: found } = await getSupabase().from("threads").select("id").eq("listing_id", listingId).eq("seeker_id", uid).maybeSingle();
          if (found) {
            await reloadThread(found.id);
            return found.id;
          }
        }
        showToast(error.message.includes("no longer available") || error.message.includes("your own") ? error.message : COPY.errors.generic);
        return null;
      }
      const row: ThreadData = { ...data, theirContact: null };
      patch((r) => ({ ...r, threads: [row, ...r.threads] }));
      return data.id;
    },
    [uid, patch, reloadThread, showToast],
  );

  const sendMessage = useCallback(
    async (threadId: string, text: string) => {
      if (!uid) return;
      const tempId = -Date.now();
      patch((r) => withMessage(r, { id: tempId, thread_id: threadId, sender_id: uid, kind: "user", body: text, created_at: new Date().toISOString() }));
      const { data, error } = await getSupabase().from("messages").insert({ thread_id: threadId, sender_id: uid, body: text }).select().single();
      if (error || !data) {
        patch((r) => ({ ...r, threads: r.threads.map((t) => (t.id === threadId ? { ...t, messages: t.messages.filter((m) => m.id !== tempId) } : t)) }));
        showToast(COPY.errors.sendFailed);
        return;
      }
      patch((r) => withMessage(r, data, tempId));
    },
    [uid, patch, showToast],
  );

  const markRead = useCallback(
    (threadId: string) => {
      if (!uid) return;
      patch((r) => ({
        ...r,
        threads: r.threads.map((t) => {
          if (t.id !== threadId) return t;
          const newest = t.messages.reduce((n, m) => Math.max(n, Date.parse(m.created_at)), 0);
          const at = new Date(Math.max(Date.now(), newest)).toISOString();
          return t.seeker_id === uid ? { ...t, seeker_read_at: at } : { ...t, host_read_at: at };
        }),
      }));
      void getSupabase().rpc("mark_thread_read", { p_thread: threadId });
    },
    [uid, patch],
  );

  const shareContact = useCallback(
    async (threadId: string) => {
      const { error } = await getSupabase().rpc("share_contact", { p_thread: threadId });
      if (error) return showToast(COPY.errors.generic);
      await reloadThread(threadId);
    },
    [reloadThread, showToast],
  );

  const report = useCallback(
    async (listingId: string, reason: string) => {
      if (!uid) return;
      const { error } = await getSupabase().from("reports").insert({ listing_id: listingId, reporter_id: uid, reason });
      if (error && error.code !== "23505") return showToast(COPY.errors.generic);
      patch((r) => ({ ...r, reported: r.reported.includes(listingId) ? r.reported : [...r.reported, listingId] }));
      showToast(COPY.toast.reported);
    },
    [uid, patch, showToast],
  );

  // ---- profile
  const updateProfile = useCallback(
    async (values: { prefs?: Json; prefs_asked?: boolean; onboarded?: boolean }) => {
      if (!uid) return;
      const { error } = await getSupabase().from("profiles").update(values).eq("id", uid);
      if (error) showToast(COPY.errors.generic);
    },
    [uid, showToast],
  );

  const unreadCount = threads.filter((t) => t.unread).length;
  const user: User | null = uid ? { email: remote?.email ?? email, name: remote?.name ?? nameFromEmail(email) } : null;
  const ready = authReady && (!uid || remote?.uid === uid || loadError !== null);

  const store: Store = {
    ready,
    configured: supabaseConfigured,
    loadError,
    reload,

    user,
    requestCode,
    verifyCode,
    signOut,

    listings,
    getListing,
    postListing,
    confirmListing,
    removeListing,

    filters,
    setFilters,

    seen,
    markSeen: (id) => setSeen((s) => (s.includes(id) ? s : [...s, id])),
    unmarkSeen: (id) => setSeen((s) => s.filter((x) => x !== id)),
    resetDeck: () => setSeen([]),

    shortlist,
    toggleSave: (id) => {
      const had = shortlist.includes(id);
      void setSaved(id, !had);
      showToast(had ? COPY.toast.unsaved : COPY.toast.saved);
    },
    save: (id) => {
      if (shortlist.includes(id)) return;
      void setSaved(id, true);
      showToast(COPY.toast.saved);
    },
    unsave: (id) => void setSaved(id, false),

    threads,
    unreadCount,
    startChat,
    sendMessage,
    markRead,
    shareContact,

    reported: remote?.reported ?? [],
    report,

    onboarded: remote?.onboarded ?? true,
    finishOnboarding: () => {
      patch((r) => ({ ...r, onboarded: true }));
      void updateProfile({ onboarded: true });
    },

    prefs: remote?.prefs ?? null,
    prefsAsked: remote?.prefsAsked ?? true,
    savePrefs: (p) => {
      patch((r) => ({ ...r, prefs: p, prefsAsked: true }));
      void updateProfile({ prefs: p as unknown as Json, prefs_asked: true });
      showToast(COPY.toast.prefsSaved);
    },
    skipPrefs: () => {
      patch((r) => ({ ...r, prefsAsked: true }));
      void updateProfile({ prefs_asked: true });
    },
    showAll,
    setShowAll,

    toast,
    showToast,
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
