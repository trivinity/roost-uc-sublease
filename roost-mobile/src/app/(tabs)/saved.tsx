import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { CompareTable } from "@/components/CompareTable";
import { ListingRow } from "@/components/ListingRow";
import { Frame } from "@/components/TopBar";
import { Button, EmptyState, H1, Muted } from "@/components/ui";
import { COPY } from "@/lib/copy";
import { haptic } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

const MAX_COMPARE = 3;

export default function Saved() {
  const c = useColors();
  const { shortlist, listings, getListing, showToast } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);

  const saved = shortlist.flatMap((id) => getListing(id) ?? []);
  const chosen = saved.filter((l) => selected.includes(l.id));
  const more = listings.filter((l) => !shortlist.includes(l.id) && l.sublessor.id !== "me").slice(0, 3);

  const toggle = (id: string) => {
    haptic();
    if (selected.includes(id)) return setSelected(selected.filter((x) => x !== id));
    if (selected.length >= MAX_COMPARE) return showToast(COPY.toast.compareLimit(MAX_COMPARE));
    setSelected([...selected, id]);
  };

  if (comparing && chosen.length >= 2) {
    return (
      <Frame>
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 8, alignItems: "flex-start" }}>
          <Button title="Back to saved" icon="arrow-back" variant="ghost" size="sm" onPress={() => setComparing(false)} />
          <H1>Compare</H1>
        </View>
        <ScrollView>
          <CompareTable listings={chosen} />
        </ScrollView>
      </Frame>
    );
  }

  return (
    <Frame>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100, gap: 14 }}>
        <View>
          <H1>Saved</H1>
          <Muted>{saved.length === 0 ? "Places you save will show up here." : "Tick 2 or 3 places to compare them side by side."}</Muted>
        </View>

        {saved.length === 0 ? (
          <EmptyState title={COPY.empty.saved.title} body={COPY.empty.saved.body} action={<Button title="Start discovering" onPress={() => router.navigate("/")} />} />
        ) : (
          saved.map((l) => {
            const on = selected.includes(l.id);
            return (
              <View key={l.id}>
                <ListingRow listing={l} mine={l.sublessor.id === "me"} />
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`Compare ${l.title}`}
                  onPress={() => toggle(l.id)}
                  hitSlop={8}
                  style={{ position: "absolute", top: 18, left: 18, width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: on ? c.brand : "#fff", backgroundColor: on ? c.brand : "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" }}
                >
                  {on && <Ionicons name="checkmark" size={16} color="#fff" />}
                </Pressable>
              </View>
            );
          })
        )}

        {saved.length > 0 && more.length > 0 && (
          <View style={{ gap: 12, paddingTop: 16 }}>
            <H1 style={{ fontSize: 20 }}>More to explore</H1>
            {more.map((l) => (
              <ListingRow key={l.id} listing={l} />
            ))}
          </View>
        )}
      </ScrollView>

      {chosen.length >= 2 && (
        <View style={{ position: "absolute", bottom: 16, left: 0, right: 0, alignItems: "center" }}>
          <Button title={`Compare ${chosen.length} places`} size="lg" onPress={() => setComparing(true)} style={{ paddingHorizontal: 28 }} />
        </View>
      )}
    </Frame>
  );
}
