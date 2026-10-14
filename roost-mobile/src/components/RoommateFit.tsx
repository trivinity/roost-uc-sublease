import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { matchFit, TRAITS } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import type { Listing } from "@/lib/types";
import { MatchBadge } from "./MatchBadge";
import { Card, Pill } from "./ui";

// Who lives there and how well they fit what you want. Whole units have no roommates.
export function RoommateFit({ listing: l }: { listing: Listing }) {
  const c = useColors();
  const { prefs } = useStore();
  const home = l.household;

  if (!home) {
    return (
      <Card style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.soft, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="people-outline" size={18} color={c.muted} />
        </View>
        <Text style={{ color: c.ink, flex: 1 }}>
          <Text style={{ fontWeight: "600" }}>Whole unit. </Text>
          <Text style={{ color: c.muted }}>No roommates to match with.</Text>
        </Text>
      </Card>
    );
  }

  const fit = prefs ? matchFit(prefs, home) : null;
  return (
    <Card style={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: c.ink, fontSize: 15, fontWeight: "600" }}>Roommates</Text>
          <Text style={{ color: c.muted, fontSize: 12 }}>
            {home.roommates} other {home.roommates === 1 ? "person lives" : "people live"} here
          </Text>
        </View>
        {fit && <MatchBadge score={fit.score} />}
      </View>

      {fit?.dealbreakers.length ? (
        <Text style={{ color: "#b91c1c", backgroundColor: c.dark ? "rgba(248,113,113,0.12)" : "#fef2f2", padding: 10, borderRadius: 14, overflow: "hidden", fontSize: 14 }}>
          Not a fit for you: {fit.dealbreakers.join(", ").toLowerCase()}.
        </Text>
      ) : null}

      {TRAITS.map((t) => {
        const theirs = home[t.id];
        const part = fit?.parts.find((p) => p.trait.id === t.id);
        const diff = part ? Math.abs(part.want - theirs) : 0;
        return (
          <View key={t.id} style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: c.muted, fontSize: 14 }}>{t.label}</Text>
              <Text style={{ color: c.ink, fontSize: 14, fontWeight: "500" }}>{t.levels[theirs - 1]}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 4 }}>
              {t.levels.map((_, i) => (
                <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < theirs ? c.ink : c.soft, opacity: i < theirs ? 0.7 : 1 }} />
              ))}
            </View>
            {part && <Text style={{ fontSize: 12, color: diff === 0 ? c.good : diff === 1 ? c.muted : "#d97706" }}>You want: {t.levels[part.want - 1]}</Text>}
          </View>
        );
      })}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pill>{home.smokeFree ? "Smoke-free" : "Smoking allowed"}</Pill>
        {home.cat && <Pill>Cat</Pill>}
        {home.dog && <Pill>Dog</Pill>}
      </View>

      {!prefs && (
        <Pressable onPress={() => router.push("/preferences")} style={{ backgroundColor: c.soft, borderRadius: 14, padding: 12 }}>
          <Text style={{ color: c.brandText, fontWeight: "600" }}>Set your roommate preferences to see how well this fits →</Text>
        </Pressable>
      )}
    </Card>
  );
}
