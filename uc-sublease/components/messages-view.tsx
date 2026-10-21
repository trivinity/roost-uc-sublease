"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  EyeOff,
  Lock,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtMoney, fmtRange } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Thread } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Photo } from "./photo";
import { COPY } from "@/lib/copy";

const QUICK = [
  "Is it still available?",
  "Can I tour this week?",
  "Does your landlord allow subletting?",
  "Is the rent negotiable?",
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
              if (!l) return null;
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
                    <div className="size-12 shrink-0 overflow-hidden rounded-full">
                      <Photo listing={l} className="size-full" thumb />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            t.unread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {l.sublessor.name}
                        </p>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {last?.time}
                        </p>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.title}
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
  const {
    getListing,
    markRead,
    sendMessage,
    shareContact,
    user,
    typingThread,
  } = useStore();
  const l = getListing(thread.listingId);
  const first = l?.sublessor.name.split(" ")[0] ?? "them";
  const [draft, setDraft] = useState(
    thread.messages.length === 0 && l
      ? `Hi ${first}! Is your ${l.neighborhood} place still available for ${fmtRange(l.startDate, l.endDate)}?`
      : "",
  );
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thread.unread) markRead(thread.id);
  }, [thread.unread, thread.id, markRead]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.messages.length, typingThread]);

  if (!l) return null;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendMessage(thread.id, text);
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
        <Link
          href={`/listing/${l.id}`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <div className="size-10 shrink-0 overflow-hidden rounded-xl">
            <Photo listing={l} className="size-full" thumb />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{l.sublessor.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {l.title} · {fmtMoney(l.rent)}/mo
            </p>
          </div>
        </Link>
      </header>

      <ContactPanel
        thread={thread}
        first={first}
        onShare={() => shareContact(thread.id)}
        myEmail={user?.email ?? ""}
      />

      <p className="border-b border-border px-4 py-2 text-center text-xs text-muted-foreground">{COPY.empty.retention}</p>

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
              {m.text}
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
        {typingThread === thread.id && (
          <div className="flex justify-start" aria-label={`${first} is typing`}>
            <span className="flex gap-1 rounded-3xl bg-muted px-4 py-3.5">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                  style={{ animationDelay: `${d * 120}ms` }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={bottom} />
      </div>

      {!draft && thread.messages.length < 6 && (
        <div className="flex gap-2 overflow-x-auto px-3 pb-1 pt-3 [scrollbar-width:none]">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setDraft(q)}
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

// Contact details stay hidden until the user opts in; the fake sublessor then shares back.
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
            <Phone className="size-4" />
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
          <Phone className="size-4" />
        ) : (
          <EyeOff className="size-4" />
        )}
        {thread.theirContactShared ? (
          <span className="text-foreground">
            {first.toLowerCase()}@mail.uc.edu · (513) 555-0187
          </span>
        ) : (
          `${first}'s contact info is hidden until they share it`
        )}
      </p>
    </div>
  );
}
