import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { bedroomLabel, fmtMoney, fmtRange, freshness } from "@/lib/format";
import { matchFit } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import type { Listing } from "@/lib/types";
import { AmenityIcons } from "./AmenityIcons";
import { MatchBadge } from "./MatchBadge";
import { Photo } from "./Photo";
import { SaveButton } from "./SaveButton";
import { AreaPill, Freshness, Pill, shadow } from "./ui";

// Photo-on-top card used in Browse, Saved and My listings.
export function ListingRow({ listing: l, mine }: { listing: Listing; mine?: boolean }) {
  const c = useColors();
  const f = freshness(l.confirmedDaysAgo);
  const { prefs } = useStore();
  const fit = prefs ? matchFit(prefs, l.household) : null;
  const open = () => router.push(`/listing/${l.id}`);
  return (
    <View style={[{ backgroundColor: c.card, borderRadius: 24, borderWidth: 1, borderColor: c.border, padding: 10 }, shadow]}>
      <View style={{ aspectRatio: 16 / 10, borderRadius: 16, overflow: "hidden" }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${l.title}, ${fmtMoney(l.rent)} per month`} onPress={open} style={{ flex: 1 }}>
          <Photo listing={l} style={{ flex: 1 }} />
        </Pressable>
        {!mine && <SaveButton id={l.id} style={{ position: "absolute", top: 8, right: 8 }} />}
        {fit && <MatchBadge score={fit.score} style={{ position: "absolute", bottom: 8, left: 8 }} />}
      </View>
      <Pressable onPress={open} style={{ paddingHorizontal: 6, paddingTop: 12, paddingBottom: 4, gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 20, fontWeight: "700", letterSpacing: -0.5, color: c.brandText }}>
            {fmtMoney(l.rent)}
            <Text style={{ fontSize: 14, fontWeight: "400", color: c.muted }}>/mo</Text>
          </Text>
          <Text style={{ fontSize: 12, color: c.muted }}>{fmtRange(l.startDate, l.endDate)}</Text>
        </View>
        <Text numberOfLines={2} style={{ fontSize: 15, fontWeight: "500", color: c.ink }}>
          {l.title}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {mine && <Pill bg={c.brand} color="#fff">Your listing</Pill>}
          <AreaPill area={l.neighborhood} miles={l.distanceMiles} />
          <Pill>
            {l.unitType === "room" ? "Room" : "Whole unit"} · {bedroomLabel(l.bedrooms)}
          </Pill>
          {l.furnished && <Pill bg={c.dark ? "rgba(251,191,36,0.15)" : "#fef3c7"} color={c.dark ? "#fcd34d" : "#78350f"}>Furnished</Pill>}
        </View>
        <View style={{ marginTop: 8 }}>
          <AmenityIcons ids={l.amenities} max={6} size={30} interactive={false} />
        </View>
        <View style={{ marginTop: 6 }}>
          <Freshness {...f} />
        </View>
      </Pressable>
    </View>
  );
}
