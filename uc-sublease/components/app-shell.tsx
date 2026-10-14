"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Bookmark, Layers, LayoutList, MessageCircle, Plus } from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";
import { ThemeSegment, ThemeToggle } from "@/components/theme";
import { PrefsPrompt } from "@/components/prefs-prompt";
import { Welcome } from "@/components/welcome";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Discover", icon: Layers },
  { href: "/list", label: "Browse", icon: LayoutList },
  { href: "/shortlist", label: "Saved", icon: Bookmark },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/post", label: "Post", icon: Plus },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, user, signOut, unreadCount, toast, onboarded, prefsAsked } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const onSignIn = pathname === "/signin";

  useEffect(() => {
    if (!ready) return;
    if (!user && !onSignIn) router.replace("/signin");
    if (user && onSignIn) router.replace("/");
  }, [ready, user, onSignIn, router]);

  // Until we know who's signed in (or while redirecting) render the page hidden rather than not at all.
  if (!ready || (!user && !onSignIn) || (user && onSignIn)) {
    return (
      <div className="invisible" aria-hidden>
        {children}
      </div>
    );
  }
  if (!user) return <>{children}</>;

  // Full-screen chat on phones, so hide the tab bar there.
  const inThread = pathname.startsWith("/messages/");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-background/70 px-4 backdrop-blur-xl backdrop-saturate-150 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="size-3 rounded-full bg-primary" aria-hidden />
            Roost
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  isActive(pathname, href) ? "font-medium text-brand" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive(pathname, href) && (
                  <motion.span
                    layoutId="nav-pill-desktop"
                    className="absolute inset-0 rounded-full bg-primary/10"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="relative flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell
            count={unreadCount}
            size={36}
            color="red"
            aria-label={`Messages, ${unreadCount} unread`}
            onClick={() => router.push("/messages")}
          />
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-label="Account menu"
            className="grid size-9 place-items-center rounded-full bg-primary text-sm font-medium text-white"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-border bg-popover p-2 shadow-lg">
                <p className="truncate px-3 py-2 text-sm text-muted-foreground">{user.email}</p>
                <div className="px-1 pb-2">
                  <ThemeSegment />
                </div>
                <Link
                  href="/preferences"
                  onClick={() => setMenu(false)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  Roommate preferences
                </Link>
                <Link
                  href="/mine"
                  onClick={() => setMenu(false)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  My listings
                </Link>
                <button
                  type="button"
                  className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setMenu(false);
                    signOut();
                  }}
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main key={pathname} className={cn("animate-in fade-in duration-300", !inThread && "pb-16 md:pb-0")}>
        {children}
      </main>

      <nav
        aria-label="Main"
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 h-16 grid-cols-5 border-t border-border/70 bg-background/75 backdrop-blur-xl backdrop-saturate-150",
          inThread ? "hidden" : "grid md:hidden",
        )}
      >
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 text-[11px]",
              isActive(pathname, href) ? "text-brand" : "text-muted-foreground",
            )}
          >
            {isActive(pathname, href) && (
              <motion.span
                layoutId="tab-bar-indicator"
                className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <Icon className="size-5" strokeWidth={isActive(pathname, href) ? 2.4 : 1.8} />
            {label}
          </Link>
        ))}
      </nav>

      {!onboarded && <Welcome />}
      {onboarded && !prefsAsked && <PrefsPrompt />}

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-[3.75rem] z-50 flex justify-center transition-all duration-200",
          toast ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
      >
        <span className="rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg">{toast}</span>
      </div>
    </div>
  );
}

export function Credits() {
  return (
    <p className="py-8 text-center text-xs text-muted-foreground">
      Demo with fake data · Photos from Unsplash · Interface details from{" "}
      <a href="https://www.rareui.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        Rare UI
      </a>
    </p>
  );
}
