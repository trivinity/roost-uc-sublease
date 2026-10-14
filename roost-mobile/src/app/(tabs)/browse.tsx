import { useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { FilterButton } from "@/components/FilterButton";
import { ListingRow } from "@/components/ListingRow";
import { Frame } from "@/components/TopBar";
import { Button, Chip, EmptyState, H1, Muted } from "@/components/ui";
import { COPY } from "@/lib/copy";
import { DEFAULT_FILTERS, filterListings } from "@/lib/filters";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";

type Sort = "match" | "cheapest" | "priciest" | "closest" | "fresh";
const SORTS: { value: Sort; label: string }[] = [
  { value: "match", label: "Recommended" },
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
  const { listings, filters, setFilters } = useStore();
  const [sort, setSort] = useState<Sort>("match");
  const results = useMemo(() => [...filterListings(listings, filters)].sort(BY[sort]), [listings, filters, sort]);

  return (
    <Frame>
      <FlatList
        data={results}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 14 }}
        ListHeaderComponent={
          <View style={{ gap: 12, paddingTop: 16, paddingBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
              <View>
                <H1>Browse</H1>
                <Muted>
                  {results.length} {results.length === 1 ? "place" : "places"} near campus
                </Muted>
              </View>
              <FilterButton />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SORTS.map((s) => (
                <Chip key={s.value} label={s.label} active={sort === s.value} onPress={() => setSort(s.value)} />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <EmptyState title={COPY.empty.noMatches.title} body={COPY.empty.noMatches.body} action={<Button title="Clear filters" onPress={() => setFilters(DEFAULT_FILTERS)} />} />
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
