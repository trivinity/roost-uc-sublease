import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Platform, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { activeFilterCount, DEFAULT_FILTERS, DISTANCE_OPTIONS, filterListings, RENT_MAX, RENT_MIN, TERMS } from "@/lib/filters";
import { fmtMoney } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import type { Filters } from "@/lib/types";
import { Button, Chip } from "./ui";

const BEDROOMS: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "Studio", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: c.border, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{title}</Text>
        {hint ? <Text style={{ fontSize: 14, color: c.muted }}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

// One filter state (in the store) feeds the deck and the list; this sheet is the only thing that edits it.
export function FilterSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  const { filters, setFilters, listings } = useStore();
  const count = activeFilterCount(filters);
  const matches = filterListings(listings, filters).length;
  const patch = (p: Partial<Filters>) => setFilters({ ...filters, ...p });
  return (
    <Modal visible={visible} animationType="slide" presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"} onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: c.popover }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: c.ink, letterSpacing: -0.4 }}>Filters</Text>
          <Pressable onPress={onClose} accessibilityLabel="Close filters" hitSlop={10} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.soft, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close" size={18} color={c.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Section title="Distance from UC" hint="Straight-line miles">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DISTANCE_OPTIONS.map((o) => (
                <Chip key={o.miles} label={o.label} active={filters.maxDistance === o.miles} onPress={() => patch({ maxDistance: o.miles })} />
              ))}
            </View>
          </Section>

          <Section title="Monthly rent" hint={`${fmtMoney(filters.minRent)} – ${fmtMoney(filters.maxRent)}${filters.maxRent >= RENT_MAX ? "+" : ""}`}>
            <Text style={{ fontSize: 12, color: c.muted }}>Minimum</Text>
            <Slider
              accessibilityLabel="Minimum rent"
              minimumValue={RENT_MIN}
              maximumValue={RENT_MAX}
              step={25}
              value={filters.minRent}
              minimumTrackTintColor={c.brand}
              thumbTintColor={c.brand}
              onSlidingComplete={(v) => patch({ minRent: Math.min(v, filters.maxRent - 25) })}
            />
            <Text style={{ fontSize: 12, color: c.muted }}>Maximum</Text>
            <Slider
              accessibilityLabel="Maximum rent"
              minimumValue={RENT_MIN}
              maximumValue={RENT_MAX}
              step={25}
              value={filters.maxRent}
              minimumTrackTintColor={c.brand}
              thumbTintColor={c.brand}
              onSlidingComplete={(v) => patch({ maxRent: Math.max(v, filters.minRent + 25) })}
            />
          </Section>

          <Section title="Available dates" hint="Covers your whole stay">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TERMS.map((t) => {
                const active = filters.from === t.from && filters.to === t.to;
                return <Chip key={t.id} label={`${t.label}  ${t.hint}`} active={active} onPress={() => patch(active ? { from: "", to: "" } : { from: t.from, to: t.to })} />;
              })}
            </View>
          </Section>

          <Section title="Bedrooms in unit">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {BEDROOMS.map((b) => (
                <Chip key={b.label} label={b.label} active={filters.bedrooms === b.value} onPress={() => patch({ bedrooms: b.value })} />
              ))}
            </View>
          </Section>

          <Section title="Furnished">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 15, color: c.ink }}>Furnished only</Text>
              <Switch value={filters.furnishedOnly} onValueChange={(v) => patch({ furnishedOnly: v })} trackColor={{ true: c.brand }} />
            </View>
          </Section>

        </ScrollView>

        <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
          <Button title="Reset" variant="ghost" size="lg" disabled={count === 0} onPress={() => setFilters(DEFAULT_FILTERS)} />
          <Button title={`Show ${matches} ${matches === 1 ? "place" : "places"}`} size="lg" style={{ flex: 1 }} onPress={onClose} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
