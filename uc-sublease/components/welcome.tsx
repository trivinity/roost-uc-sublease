"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  EyeOff,
  Lock,
  MessageCircle,
  ShieldCheck,
  X,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RIGHT_SWIPE_ACTION } from "@/lib/config";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const RIGHT =
  RIGHT_SWIPE_ACTION === "message"
    ? "message the sublessor"
    : "save it to your shortlist";

function SwipeVisual() {
  const cards = [
    {
      src: "/photos/living-2.jpg",
      cls: "-rotate-12 -translate-x-16 translate-y-3",
    },
    {
      src: "/photos/kitchen-4.jpg",
      cls: "rotate-12 translate-x-16 translate-y-3",
    },
    { src: "/photos/bedroom-1.jpg", cls: "z-10" },
  ];
  const RightIcon = RIGHT_SWIPE_ACTION === "message" ? MessageCircle : Bookmark;
  return (
    <div className="relative mx-auto h-64 w-full max-w-xs">
      {cards.map((c) => (
        <div
          key={c.src}
          className={cn(
            "absolute left-1/2 top-2 h-52 w-36 -ml-[4.5rem] overflow-hidden rounded-2xl shadow-float ring-1 ring-black/5",
            c.cls,
          )}
        >
          <Image
            src={c.src}
            alt=""
            fill
            sizes="150px"
            className="object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center gap-10">
        <span className="grid size-12 place-items-center rounded-full border border-border bg-background shadow-lift">
          <X className="size-5" />
        </span>
        <span className="grid size-12 place-items-center rounded-full bg-primary text-white shadow-lift">
          <RightIcon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function TrustVisual() {
  const chips = [
    { icon: BadgeCheck, text: "UC verified", cls: "left-0 top-6 -rotate-3" },
    {
      icon: ShieldCheck,
      text: "Landlord consent",
      cls: "right-0 top-24 rotate-2",
    },
    {
      icon: BadgeCheck,
      text: "Confirmed this week",
      cls: "left-6 bottom-4 -rotate-1",
    },
  ];
  return (
    <div className="relative mx-auto grid h-64 w-full max-w-xs place-items-center">
      <div className="grid size-32 place-items-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.45_0.2_20)] text-white shadow-float">
        <ShieldCheck className="size-14" strokeWidth={1.5} />
      </div>
      {chips.map(({ icon: Icon, text, cls }) => (
        <span
          key={text}
          className={cn(
            "absolute inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-lift",
            cls,
          )}
        >
          <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />{" "}
          {text}
        </span>
      ))}
    </div>
  );
}

function PrivacyVisual() {
  return (
    <div className="relative mx-auto grid h-64 w-full max-w-xs content-center gap-3">
      <div className="ml-auto max-w-[75%] rounded-3xl bg-primary px-4 py-2.5 text-[15px] text-white">
        Is it still available?
      </div>
      <div className="max-w-[75%] rounded-3xl bg-muted px-4 py-2.5 text-[15px]">
        Yes! Want to tour this week?
      </div>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-3.5 shadow-lift">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
          <Lock className="size-4" />
        </span>
        <div className="min-w-0 text-sm">
          <p className="flex items-center gap-1.5 font-medium">
            <EyeOff className="size-3.5" /> Contact info hidden
          </p>
          <p className="text-muted-foreground">
            Share it only when you&apos;re ready
          </p>
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  {
    visual: <SwipeVisual />,
    title: "Swipe to find your place",
    body: `Swipe right to ${RIGHT}, left to pass. Tap a photo to see more pictures.`,
  },
  {
    visual: <TrustVisual />,
    title: "Real students, real leases",
    body: "Everyone signs in with a UC email, and every listing confirms the lease allows subletting.",
  },
  {
    visual: <PrivacyVisual />,
    title: "You choose what to share",
    body: "Your phone and email stay hidden until you decide to share them in a chat.",
  },
];

// Shown once, right after the first sign-in.
export function Welcome() {
  const { finishOnboarding } = useStore();
  const scroller = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;

  const go = (n: number) => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(Math.min(SLIDES.length - 1, i + 1));
      else if (e.key === "ArrowLeft") go(Math.max(0, i - 1));
      else if (e.key === "Escape") finishOnboarding();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, finishOnboarding]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Roost"
      className="fixed inset-0 z-[60] flex animate-in flex-col bg-background duration-300 fade-in"
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-6 pb-8 pt-5">
        <div className="flex h-10 items-center justify-between">
          <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="size-3 rounded-full bg-primary" aria-hidden />{" "}
            Roost
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={finishOnboarding}
            className="text-muted-foreground"
          >
            Skip
          </Button>
        </div>

        <div
          ref={scroller}
          onScroll={(e) =>
            setI(
              Math.round(
                e.currentTarget.scrollLeft / e.currentTarget.clientWidth,
              ),
            )
          }
          className="flex flex-1 snap-x snap-mandatory items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SLIDES.map((s) => (
            <section
              key={s.title}
              className="flex min-w-full snap-center flex-col gap-8 px-1"
              aria-roledescription="slide"
            >
              {s.visual}
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {s.title}
                </h2>
                <p className="mx-auto max-w-xs text-[15px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-5">
          <div
            className="flex justify-center gap-2"
            role="tablist"
            aria-label="Slides"
          >
            {SLIDES.map((s, n) => (
              <button
                key={s.title}
                role="tab"
                aria-selected={n === i}
                aria-label={`Slide ${n + 1}`}
                onClick={() => go(n)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  n === i ? "w-6 bg-primary" : "w-2 bg-border",
                )}
              />
            ))}
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => (last ? finishOnboarding() : go(i + 1))}
          >
            {last ? "Get started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
