import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { COPY } from "./copy";
import { DEFAULT_FILTERS } from "./filters";
import { LISTINGS, SEED_THREADS } from "./listings";
import { DEFAULT_PREFS } from "./roommates";
import type { Filters, Listing, Message, Prefs, Thread, User } from "./types";

// Everything lives in React state and is mirrored to AsyncStorage so closing the app doesn't wipe the demo.
const STORAGE_KEY = "roost-demo-v2"; // v2: distance search + roommate preferences

interface Persisted {
  user: User | null;
  posted: Listing[];
  filters: Filters;
  seen: string[];
  shortlist: string[];
  threads: Thread[];
  reported: string[];
  onboarded?: boolean;
  prefs?: Prefs | null;
  prefsAsked?: boolean;
  showAll?: boolean;
}

const REPLIES = [
  "Sounds good! When are you free to tour?",
  "Yep, still available. I can show it over video if you're not in town.",
  "Happy to answer anything. Landlord already signed off on the sublease.",
  "Great question. I'll send photos of that tonight.",
];

const uid = () => Math.random().toString(36).slice(2, 10);

interface Store {
  ready: boolean;
  user: User | null;
  signIn: (email: string) => void;
  signOut: () => void;

  listings: Listing[];
  getListing: (id: string) => Listing | undefined;
  addListing: (l: Listing) => void;
  confirmListing: (id: string) => void;
  removeListing: (id: string) => void;

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
  typingThread: string | null;
  unreadCount: number;
  startChat: (listingId: string) => string;
  sendMessage: (threadId: string, text: string) => void;
  markRead: (threadId: string) => void;
  shareContact: (threadId: string) => void;

  reported: string[];
  report: (listingId: string) => void;

  onboarded: boolean;
  finishOnboarding: () => void;

  // roommate preferences: null until filled in; prefsAsked is set once they answered or skipped
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [posted, setPosted] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [seen, setSeen] = useState<string[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [reported, setReported] = useState<string[]>([]);
  const [onboarded, setOnboarded] = useState(false);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [prefsAsked, setPrefsAsked] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [typingThread, setTypingThread] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load once, then start saving.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const p = JSON.parse(raw) as Persisted;
        setUser(p.user);
        setPosted(p.posted);
        setFilters({ ...DEFAULT_FILTERS, ...p.filters });
        setSeen(p.seen);
        setShortlist(p.shortlist);
        setThreads(p.threads);
        setReported(p.reported);
        setOnboarded(p.onboarded ?? false);
        setPrefs(p.prefs ? { ...DEFAULT_PREFS, ...p.prefs } : null);
        setPrefsAsked(p.prefsAsked ?? false);
        setShowAll(p.showAll ?? false);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { user, posted, filters, seen, shortlist, threads, reported, onboarded, prefs, prefsAsked, showAll };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [ready, user, posted, filters, seen, shortlist, threads, reported, onboarded, prefs, prefsAsked, showAll]);

  const listings = useMemo(() => [...posted, ...LISTINGS], [posted]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const updateThread = useCallback((id: string, fn: (t: Thread) => Thread) => {
    setThreads((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));
  }, []);

  const addMessage = useCallback(
    (threadId: string, from: Message["from"], text: string) => {
      const msg: Message = { id: uid(), from, text, time: "Now" };
      updateThread(threadId, (t) => ({ ...t, messages: [...t.messages, msg] }));
    },
    [updateThread],
  );

  const store: Store = {
    ready,
    user,
    signIn: (email) => {
      const local = email.split("@")[0].replace(/[._-]+/g, " ");
      setUser({ email: email.toLowerCase(), name: local.charAt(0).toUpperCase() + local.slice(1) });
    },
    signOut: () => setUser(null),

    listings,
    getListing: (id) => listings.find((l) => l.id === id),
    addListing: (l) => setPosted((p) => [l, ...p]),
    confirmListing: (id) => {
      setPosted((p) => p.map((l) => (l.id === id ? { ...l, confirmedDaysAgo: 0 } : l)));
      showToast(COPY.toast.confirmed);
    },
    removeListing: (id) => {
      setPosted((p) => p.filter((l) => l.id !== id));
      setShortlist((s) => s.filter((x) => x !== id));
      showToast(COPY.toast.rented);
    },

    filters,
    setFilters,

    seen,
    markSeen: (id) => setSeen((s) => (s.includes(id) ? s : [...s, id])),
    unmarkSeen: (id) => setSeen((s) => s.filter((x) => x !== id)),
    resetDeck: () => setSeen([]),

    shortlist,
    toggleSave: (id) => {
      const had = shortlist.includes(id);
      setShortlist((s) => (had ? s.filter((x) => x !== id) : [...s, id]));
      showToast(had ? COPY.toast.unsaved : COPY.toast.saved);
    },
    save: (id) => {
      if (shortlist.includes(id)) return;
      setShortlist((s) => [...s, id]);
      showToast(COPY.toast.saved);
    },
    unsave: (id) => setShortlist((s) => s.filter((x) => x !== id)),

    threads,
    typingThread,
    unreadCount: threads.filter((t) => t.unread).length,
    startChat: (listingId) => {
      const id = `t-${listingId}`;
      if (!threads.some((t) => t.id === id)) {
        setThreads((ts) => [{ id, listingId, messages: [], unread: false, myContactShared: false, theirContactShared: false }, ...ts]);
      }
      return id;
    },
    sendMessage: (threadId, text) => {
      addMessage(threadId, "me", text);
      // Fake sublessor reply (with a typing indicator) so the demo feels alive.
      setTimeout(() => setTypingThread(threadId), 400);
      setTimeout(() => {
        setTypingThread(null);
        addMessage(threadId, "them", REPLIES[Math.floor(Math.random() * REPLIES.length)]);
      }, 1800);
    },
    markRead: (threadId) => updateThread(threadId, (t) => (t.unread ? { ...t, unread: false } : t)),
    shareContact: (threadId) => {
      updateThread(threadId, (t) => ({ ...t, myContactShared: true }));
      addMessage(threadId, "system", "You shared your contact info.");
      setTimeout(() => {
        updateThread(threadId, (t) => ({ ...t, theirContactShared: true }));
        addMessage(threadId, "system", "They shared their contact info too.");
      }, 1600);
    },

    reported,
    report: (listingId) => {
      setReported((r) => (r.includes(listingId) ? r : [...r, listingId]));
      showToast(COPY.toast.reported);
    },

    onboarded,
    finishOnboarding: () => setOnboarded(true),

    prefs,
    prefsAsked,
    savePrefs: (p) => {
      setPrefs(p);
      setPrefsAsked(true);
      showToast(COPY.toast.prefsSaved);
    },
    skipPrefs: () => setPrefsAsked(true),
    showAll,
    setShowAll,

    toast,
    showToast,
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
