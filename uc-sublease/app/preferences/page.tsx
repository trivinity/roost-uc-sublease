"use client";

import { useRouter } from "next/navigation";
import { PreferencesForm } from "@/components/preferences-form";
import { useStore } from "@/lib/store";

export default function PreferencesPage() {
  const router = useRouter();
  const { prefs } = useStore();
  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-6 md:px-6">
      <div className="pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Roommate preferences</h1>
        <p className="text-sm text-muted-foreground">
          Quick rating scales, no typing. We rank places by how well the roommates fit what you want, and you can always tap Show all to see everything.
        </p>
      </div>
      <PreferencesForm submitLabel={prefs ? "Save changes" : "Save preferences"} onDone={() => router.push("/")} />
    </div>
  );
}
