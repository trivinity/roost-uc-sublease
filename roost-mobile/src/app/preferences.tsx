import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckRow, RatingScale } from "@/components/RatingScale";
import { Button, Muted } from "@/components/ui";
import { DEFAULT_PREFS, TRAITS } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import type { Prefs, Traits } from "@/lib/types";

function Heading({ title, hint }: { title: string; hint: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: c.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.4 }}>{title}</Text>
      <Muted>{hint}</Muted>
    </View>
  );
}

// Rating scales and checkboxes only (no typing). Shown once after the welcome slides, and editable from Account.
export default function Preferences() {
  const c = useColors();
  const { prefs, prefsAsked, savePrefs, skipPrefs } = useStore();
  const [draft, setDraft] = useState<Prefs>(prefs ?? DEFAULT_PREFS);
  const set = (side: "want" | "me", id: keyof Traits, v: number) => setDraft((d) => ({ ...d, [side]: { ...d[side], [id]: v } }));
  const goHome = () => (router.canDismiss() ? router.dismiss() : router.replace("/"));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 28, paddingBottom: 48 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: c.ink, fontSize: 28, fontWeight: "700", letterSpacing: -0.7 }}>{prefsAsked ? "Roommate preferences" : "Find roommates you'll click with"}</Text>
          <Muted>About a minute, all taps. We show the best fits first, and you can always tap Show all.</Muted>
        </View>

        <Heading title="What I'm looking for" hint="Pick the home you'd like to live in. We use this to rank places by fit." />
        <View style={{ gap: 22 }}>
          {TRAITS.map((t) => (
            <RatingScale key={t.id} def={t} value={draft.want[t.id]} onChange={(v) => set("want", t.id, v)} />
          ))}
        </View>
        <View style={{ gap: 8 }}>
          <CheckRow checked={draft.wantSmokeFree} onChange={(v) => setDraft((d) => ({ ...d, wantSmokeFree: v }))}>
            Smoke-free home only
          </CheckRow>
          <CheckRow checked={draft.okCats} onChange={(v) => setDraft((d) => ({ ...d, okCats: v }))}>
            Fine with cats in the home
          </CheckRow>
          <CheckRow checked={draft.okDogs} onChange={(v) => setDraft((d) => ({ ...d, okDogs: v }))}>
            Fine with dogs in the home
          </CheckRow>
        </View>

        <Heading title="About me" hint="Rate yourself honestly. Hosts can see this when you message them." />
        <View style={{ gap: 22 }}>
          {TRAITS.map((t) => (
            <RatingScale key={t.id} def={t} value={draft.me[t.id]} onChange={(v) => set("me", t.id, v)} label={`${t.label} (me)`} />
          ))}
        </View>
        <View style={{ gap: 8 }}>
          <CheckRow checked={draft.hasCat} onChange={(v) => setDraft((d) => ({ ...d, hasCat: v }))}>
            I have a cat
          </CheckRow>
          <CheckRow checked={draft.hasDog} onChange={(v) => setDraft((d) => ({ ...d, hasDog: v }))}>
            I have a dog
          </CheckRow>
        </View>

        <Button
          title={prefsAsked ? "Save changes" : "Save and start browsing"}
          size="lg"
          onPress={() => {
            savePrefs(draft);
            goHome();
          }}
        />
        {!prefsAsked && (
          <Button
            title="Skip for now"
            variant="ghost"
            onPress={() => {
              skipPrefs();
              goHome();
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
