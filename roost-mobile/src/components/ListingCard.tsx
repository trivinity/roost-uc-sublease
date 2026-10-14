import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import { fmtMiles, fmtMoney, fmtRange } from "@/lib/format";
import { priceInsight } from "@/lib/insights";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import type { Listing } from "@/lib/types";
import { Photo } from "./Photo";
import { SaveButton } from "./SaveButton";
import { HoodPill, shadow } from "./ui";

// The face of a deck card. Fills its parent, so the parent controls the size.
export function ListingCard({ listing: l, interactive = false, onOpen }: { listing: Listing; interactive?: boolean; onOpen?: () => void }) {
  const c = useColors();
  const { listings } = useStore();
  const insight = priceInsight(l, listings);
  const [i, setI] = useState(0);
  const [w, setW] = useState(1);
  const last = l.photos.length - 1;

  return (
    <View style={[{ flex: 1, borderRadius: 28, overflow: "hidden", backgroundColor: c.card, borderWidth: 1, borderColor: c.border }, shadow]}>
      <View style={{ flex: 1 }} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          disabled={!interactive}
          // left third = previous photo, anywhere else = next
          onPress={(e) => setI((n) => (e.nativeEvent.locationX < w / 3 ? Math.max(0, n - 1) : Math.min(last, n + 1)))}
          accessibilityLabel="Tap for more photos"
        >
          <Photo listing={l} index={i} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        </Pressable>
        <View style={{ position: "absolute", top: 12, left: 14, right: 14, flexDirection: "row", gap: 5 }} pointerEvents="none">
          {l.photos.map((_, n) => (
            <View key={n} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: n === i ? "#fff" : "rgba(255,255,255,0.45)" }} />
          ))}
        </View>
        {l.furnished && (
          <View style={{ position: "absolute", top: 30, left: 14, backgroundColor: "#fcd34d", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, flexDirection: "row", alignItems: "center", gap: 5 }} pointerEvents="none">
            <Ionicons name="bed-outline" size={13} color="#451a03" />
            <Text style={{ color: "#451a03", fontSize: 12, fontWeight: "600" }}>Furnished</Text>
          </View>
        )}
        <SaveButton id={l.id} style={{ position: "absolute", top: 28, right: 14 }} />
        {insight?.tone === "great" && (
          <View style={{ position: "absolute", bottom: 12, left: 14, backgroundColor: "#10b981", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 }} pointerEvents="none">
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Great price</Text>
          </View>
        )}
      </View>

      <Pressable onPress={onOpen} disabled={!onOpen} style={{ padding: 18, gap: 6 }} accessibilityRole="button" accessibilityLabel={`Open ${l.title}`}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 28, fontWeight: "700", letterSpacing: -0.8, color: c.brandText }}>
            {fmtMoney(l.rent)}
            <Text style={{ fontSize: 16, fontWeight: "400", color: c.muted }}>/mo</Text>
          </Text>
          <Text style={{ fontSize: 13, color: c.muted }}>{fmtRange(l.startDate, l.endDate)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: "500", color: c.ink }}>
            {l.title}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <HoodPill hood={l.neighborhood} />
          <Text style={{ fontSize: 13, color: c.muted }}>{fmtMiles(l.distanceMiles)} to campus</Text>
        </View>
      </Pressable>
    </View>
  );
}
