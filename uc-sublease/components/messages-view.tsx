"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  EyeOff,
  Lock,
  MessageCircle,
  Mail,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtMoney, fmtRange } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Thread } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Photo } from "./photo";
import { COPY } from "@/lib/copy";

// One set for students asking about a place, one for the host answering.
const QUICK = [
  "Is it still available?",
  "Can I tour this week?",
  "Does your landlord allow subletting?",
  "Is the rent negotiable?",
];
const HOST_QUICK = [
  "Yes, it's still available",
  "When would you like to tour?",
  "The landlord has approved subletting",
  "I can send more photos",
];

export function MessagesView({ activeId }: { activeId?: string }) {
  const { threads, getListing } = useStore();
  const active = threads.find((t) => t.id === activeId);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-5xl md:grid md:h-[calc(100dvh-3.5rem)] md:grid-cols-[22rem_1fr] md:border-x md:border-border",
        active ? "h-[calc(100dvh-3.5rem)]" : "h-[calc(100dvh-3.5rem-4rem)]",
      )}
    >
      <aside
        className={cn(
          "overflow-y-auto md:border-r md:border-border",
          active ? "hidden md:block" : "block",
        )}
      >
        <h1 className="px-5 pb-3 pt-6 text-2xl font-semibold tracking-tight">
          Messages
        </h1>
        {threads.every((t) => t.messages.length === 0) && (
          <p className="px-5 text-sm text-muted-foreground">
            {COPY.empty.inbox}
          </p>
        )}
        <ul>
          {threads
            .filter((t) => t.messages.length > 0 || t.id === activeId)
            .map((t) => {
              const l = getListing(t.listingId);
              const last = t.messages[t.messages.length - 1];
              return (
                <li key={t.id}>
                  <Link
                    href={`/messages/${t.id}`}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60",
                      t.id === activeId && "bg-muted",
                    )}
                  >
                    <div className="size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                      {l && <Photo listing={l} className="size-full" thumb />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            t.unread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {t.otherName ?? l?.sublessor.name}
                        </p>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {last?.time}
                        </p>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {l?.title ?? t.listingTitle}
                      </p>
                      <p
                        className={cn(
                          "truncate text-sm",
                          t.unread
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {last ? last.text : "Say hello"}
                      </p>
                    </div>
                    {t.unread && (
                      <span
                        className="size-2.5 shrink-0 rounded-full bg-blue-500"
                        aria-label="Unread"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
        </ul>
      </aside>

      <section
        className={cn("h-full min-h-0", active ? "block" : "hidden md:block")}
      >
        {active ? (
          <ChatThread key={active.id} thread={active} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
              <MessageCircle className="size-6" />
            </div>
            <p className="font-medium">{COPY.empty.pickChat.title}</p>
            <p className="max-w-60 text-sm text-muted-foreground">
              {COPY.empty.pickChat.body}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ChatThread({ thread }: { thread: Thread }) {
  const { getListing, markRead, sendMessage, shareContact, user } = useStore();
  const l = getListing(thread.listingId);
  const other = thread.otherName ?? l?.sublessor.name ?? "them";
  const first = other.split(" ")[0];
  const [draft, setDraft] = useState(
    thread.messages.length === 0 && l
      ? `Hi ${first}! Is your ${l.neighborhood} place still available for ${fmtRange(l.startDate, l.endDate)}?`
      : "",
  );
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const quick = thread.role === "host" ? HOST_QUICK : QUICK;
  // system lines are written once for both people; show them from the viewer's side
  const tidy = (t: string) =>
    user
      ? t
          .replace(
            `${user.name} shared their contact info too.`,
            "You shared your contact info too.",
          )
          .replace(
            `${user.name} shared their contact info.`,
            "You shared your contact info.",
          )
      : t;

  useEffect(() => {
    if (thread.unread) markRead(thread.id);
  }, [thread.unread, thread.id, markRead]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.messages.length]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    void sendMessage(thread.id, text);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/messages"
          aria-label="Back to messages"
          className="grid size-9 place-items-center rounded-full hover:bg-muted md:hidden"
        >
          <ArrowLeft className="size-5" />
        </Link>
        {l ? (
          <Link
            href={`/listing/${l.id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="size-10 shrink-0 overflow-hidden rounded-xl">
              <Photo listing={l} className="size-full" thumb />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{other}</p>
              <p className="truncate text-xs text-muted-foreground">
                {l.title} · {fmtMoney(l.rent)}/mo
              </p>
            </div>
          </Link>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{other}</p>
            <p className="truncate text-xs text-muted-foreground">
              {thread.listingTitle} · no longer listed
            </p>
          </div>
        )}
      </header>

      <ContactPanel
        thread={thread}
        first={first}
        onShare={() => void shareContact(thread.id)}
        myEmail={user?.email ?? ""}
      />

      <p className="border-b border-border px-4 py-2 text-center text-xs text-muted-foreground">
        {COPY.empty.retention}
        {l?.isSample && (
          <span className="block text-amber-700 dark:text-amber-300">
            {COPY.empty.sample}
          </span>
        )}
      </p>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {thread.messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            {COPY.empty.startChat}
          </p>
        )}
        {thread.messages.map((m) =>
          m.from === "system" ? (
            <p
              key={m.id}
              className="py-1 text-center text-xs text-muted-foreground"
            >
              {tidy(m.text)}
            </p>
          ) : (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.from === "me" ? "justify-end" : "justify-start",
              )}
            >
              <p
                className={cn(
                  "max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] leading-snug",
                  m.from === "me" ? "bg-primary text-white" : "bg-muted",
                )}
              >
                {m.text}
              </p>
            </div>
          ),
        )}
        <div ref={bottom} />
      </div>

      {!draft && thread.messages.length < 6 && (
        <div className="flex gap-2 overflow-x-auto px-3 pb-1 pt-3 [scrollbar-width:none]">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setDraft(q);
                input.current?.focus();
              }}
              className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-brand"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          ref={input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message"
          aria-label="Message"
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-base outline-none focus:border-primary"
        />
        <Button
          type="submit"
          size="icon-lg"
          className="size-11"
          disabled={!draft.trim()}
          aria-label="Send"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

// Contact details stay hidden until each person opts in. The server only hands over the other person's email after they shared it.
function ContactPanel({
  thread,
  first,
  onShare,
  myEmail,
}: {
  thread: Thread;
  first: string;
  onShare: () => void;
  myEmail: string;
}) {
  return (
    <div className="space-y-2 border-b border-border bg-muted/40 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-muted-foreground">
          {thread.myContactShared ? (
            <Mail className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
          {thread.myContactShared
            ? `You shared ${myEmail}`
            : "Your contact info is hidden"}
        </p>
        {!thread.myContactShared && (
          <Button size="sm" variant="outline" onClick={onShare}>
            Share mine
          </Button>
        )}
      </div>
      <p className="flex items-center gap-2 text-muted-foreground">
        {thread.theirContactShared ? (
          <Mail className="size-4" />
        ) : (
          <EyeOff className="size-4" />
        )}
        {thread.theirContactShared ? (
          <span className="text-foreground">
            {thread.theirContact ?? "Loading…"}
          </span>
        ) : (
          `${first}'s contact info is hidden until they share it`
        )}
      </p>
    </div>
  );
}
