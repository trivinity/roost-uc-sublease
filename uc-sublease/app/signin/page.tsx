"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, BadgeCheck, EyeOff, ShieldCheck } from "lucide-react";
import { Credits } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { OtpInput, type OtpStatus } from "@/components/ui/otp-input";
import { useStore } from "@/lib/store";
import { COPY } from "@/lib/copy";

const TRUST = [
  { icon: BadgeCheck, text: "Only verified UC students can join" },
  { icon: ShieldCheck, text: "Every sublease needs landlord consent" },
  { icon: EyeOff, text: "Contact info stays private until you share it" },
];

function Collage({ className }: { className?: string }) {
  const shots = [
    { src: "/photos/living-2.jpg", cls: "-rotate-6 translate-y-3" },
    { src: "/photos/bedroom-1.jpg", cls: "z-10 scale-110" },
    { src: "/photos/kitchen-4.jpg", cls: "rotate-6 translate-y-3" },
  ];
  return (
    <div className={className} aria-hidden>
      {shots.map((s) => (
        <div key={s.src} className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-float ring-2 ring-white/70 ${s.cls}`}>
          <Image src={s.src} alt="" fill sizes="200px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

const LAST_EMAIL_KEY = "roost-last-email";

export default function SignInPage() {
  const { requestCode, verifyCode } = useStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const [status, setStatus] = useState<OtpStatus>("idle");
  const [codeError, setCodeError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Prefill the email: the one used last time on this device, or (local dev only) NEXT_PUBLIC_PREFILL_EMAIL from .env.local.
  // That variable is deliberately not set on the live site, so nobody else's email ever appears there.
  /* eslint-disable react-hooks/set-state-in-effect -- one-time prefill from localStorage after hydration */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_EMAIL_KEY) || process.env.NEXT_PUBLIC_PREFILL_EMAIL || "";
      if (saved) setEmail(saved);
    } catch {
      // storage blocked: the field just starts empty
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // one code per minute (the email service enforces this too)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async () => {
    setSending(true);
    setError("");
    const err = await requestCode(email);
    setSending(false);
    if (err) {
      setError(err);
      return false;
    }
    setCooldown(60);
    try {
      localStorage.setItem(LAST_EMAIL_KEY, email.trim().toLowerCase());
    } catch {
      // not remembered; no harm done
    }
    return true;
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(COPY.signin.badEmail);
      return;
    }
    if (await sendCode()) setStep("code");
  };

  const checkCode = async (code: string) => {
    const err = await verifyCode(email, code);
    if (err) {
      setCodeError(err);
      setStatus("error");
    } else {
      setStatus("success"); // the app moves on by itself once the session is ready
    }
  };

  return (
    <div className="relative min-h-dvh md:grid md:grid-cols-[1.05fr_1fr]">
      <ThemeToggle className="absolute right-4 top-4 z-20" />

      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[oklch(0.62_0.22_25)] via-[oklch(0.5_0.21_22)] to-[oklch(0.28_0.09_20)] p-12 text-white md:flex md:flex-col">
        <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="size-3 rounded-full bg-white" aria-hidden /> Roost
        </p>
        {/* centered in the space under the logo, so tall screens never leave a big empty band */}
        <div className="flex flex-1 flex-col justify-center gap-12 py-8">
          <Collage className="mx-auto grid w-full max-w-lg grid-cols-3 gap-5" />
          <div className="mx-auto w-full max-w-lg space-y-6">
            <h2 className="max-w-md text-4xl font-semibold leading-[1.1] xl:text-5xl tracking-tight">Find your next place, on your co-op schedule.</h2>
            <ul className="space-y-3 text-base text-white/85">
              {TRUST.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon className="size-[18px] shrink-0" /> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-amber-300/15 blur-3xl" />
      </aside>

      <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 md:min-h-0">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-5 text-center md:text-left">
            <Collage className="mx-auto grid w-52 grid-cols-3 gap-2 pb-4 md:hidden" />
            <div className="space-y-2">
              <p className="flex items-center justify-center gap-2 text-3xl font-semibold tracking-tight md:hidden">
                <span className="size-3 rounded-full bg-primary" aria-hidden /> Roost
              </p>
              <h1 className="hidden text-3xl font-semibold tracking-tight md:block">Welcome back</h1>
              <p className="text-muted-foreground">Verified student subleases near UC.</p>
            </div>
          </div>

          {step === "email" ? (
            <form onSubmit={submitEmail} className="space-y-4" noValidate>
              <label className="block space-y-2 text-sm font-medium">
                UC email
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="bearcat@mail.uc.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  aria-invalid={!!error}
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base font-normal outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/15 aria-invalid:border-destructive"
                />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={sending}>
                {sending ? "Sending…" : "Send code"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1 text-center md:text-left">
                <p className="font-medium">Enter your 6-digit code</p>
                <p className="text-sm text-muted-foreground">We emailed it to {email.trim()}. It can take a minute to arrive.</p>
              </div>
              <div className="flex justify-center md:justify-start">
                <OtpInput length={6} size="md" autoFocus status={status} onChange={() => setStatus("idle")} onComplete={(c) => void checkCode(c)} />
              </div>
              <p className="h-5 text-center text-sm text-destructive md:text-left" aria-live="polite">
                {status === "error" ? codeError : ""}
              </p>
              <div className="flex flex-col items-center gap-1 md:items-start">
                <Button variant="ghost" disabled={cooldown > 0 || sending} onClick={() => void sendCode()}>
                  {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("email");
                    setStatus("idle");
                    setError("");
                  }}
                >
                  <ArrowLeft className="size-4" /> Use a different email
                </Button>
              </div>
            </div>
          )}

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground md:justify-start">
            <ShieldCheck className="size-3.5" /> We only use your UC email to confirm you&apos;re a student.
          </p>
        </div>
        <Credits />
      </main>
    </div>
  );
}
