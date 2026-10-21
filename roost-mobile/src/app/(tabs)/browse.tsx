import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text , FlatList, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { FilterButton } from "@/components/FilterButton";
import { FitToggle } from "@/components/FitToggle";
import { ListingsMap } from "@/components/ListingsMap";
import { ListingRow } from "@/components/ListingRow";
import { Frame } from "@/components/TopBar";
import { Button, Chip, EmptyState, H1, Muted } from "@/components/ui";
import { COPY } from "@/lib/copy";
import { DEFAULT_FILTERS, DISTANCE_ANY, filterListings } from "@/lib/filters";
import { rankByFit } from "@/lib/ranking";
import { useColors } from "@/lib/theme";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";

type Sort = "match" | "cheapest" | "priciest" | "closest" | "fresh";
const SORTS: { value: Sort; label: string }[] = [
  { value: "match", label: "Best fit" },
  { value: "cheapest", label: "Lowest price" },
  { value: "priciest", label: "Highest price" },
  { value: "closest", label: "Closest" },
  { value: "fresh", label: "Recently confirmed" },
];
const BY: Record<Sort, (a: Listing, b: Listing) => number> = {
  match: () => 0,
  cheapest: (a, b) => a.rent - b.rent,
  priciest: (a, b) => b.rent - a.rent,
  closest: (a, b) => a.distanceMiles - b.distanceMiles,
  fresh: (a, b) => a.confirmedDaysAgo - b.confirmedDaysAgo,
};

export default function Browse() {
  const c = useColors();
  const { listings, filters, setFilters, prefs, showAll, setShowAll } = useStore();
  const [sort, setSort] = useState<Sort>("match");
  const [view, setView] = useState<"list" | "map">("list");
  const ranked = useMemo(() => rankByFit(filterListings(listings, filters), prefs, showAll), [listings, filters, prefs, showAll]);
  const results = useMemo(() => [...ranked.listings].sort(BY[sort]), [ranked, sort]);

  return (
    <Frame>
      <FlatList
        data={view === "map" ? [] : results}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 14 }}
        ListHeaderComponent={
          <View style={{ gap: 12, paddingTop: 16, paddingBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
              <View>
                <H1>Browse</H1>
                <Muted>
                  {results.length} {results.length === 1 ? "place" : "places"}
                  {filters.maxDistance < DISTANCE_ANY ? ` within ${filters.maxDistance} mi of UC` : " near UC"}
                </Muted>
              </View>
              <FilterButton />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <FitToggle hidden={ranked.hidden} />
              <View style={{ flexDirection: "row", backgroundColor: c.soft, borderRadius: 99, padding: 3 }}>
                {(["list", "map"] as const).map((v) => (
                  <Pressable key={v} accessibilityRole="tab" accessibilityState={{ selected: view === v }} onPress={() => setView(v)} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: view === v ? c.brand : "transparent" }}>
                    <Ionicons name={v === "list" ? "list" : "map"} size={14} color={view === v ? "#fff" : c.muted} />
                    <Text style={{ color: view === v ? "#fff" : c.muted, fontSize: 13, fontWeight: "600" }}>{v === "list" ? "List" : "Map"}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SORTS.map((s) => (
                <Chip key={s.value} label={s.label} active={sort === s.value} onPress={() => setSort(s.value)} />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          view === "map" && results.length > 0 ? (
            <ListingsMap listings={results} maxDistance={filters.maxDistance} />
          ) : (
            <EmptyState
              title={ranked.hidden > 0 ? COPY.empty.weakFits.title : COPY.empty.noMatches.title}
              body={ranked.hidden > 0 ? COPY.empty.weakFits.body(ranked.hidden) : COPY.empty.noMatches.body}
              action={ranked.hidden > 0 ? <Button title="Show all" onPress={() => setShowAll(true)} /> : <Button title="Clear filters" onPress={() => setFilters(DEFAULT_FILTERS)} />}
            />
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(350)}>
            <ListingRow listing={item} mine={item.sublessor.id === "me"} />
          </Animated.View>
        )}
      />
    </Frame>
  );
}
