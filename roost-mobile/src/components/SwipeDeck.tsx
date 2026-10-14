/* eslint-disable react-hooks/immutability -- Reanimated shared values are meant to be assigned to (`x.value = ...`) */
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { COPY } from "@/lib/copy";
import { RIGHT_SWIPE_ACTION } from "@/lib/config";
import { DEFAULT_FILTERS, filterListings } from "@/lib/filters";
import { haptic } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import type { Listing } from "@/lib/types";
import { rankByFit } from "@/lib/ranking";
import { FilterButton } from "./FilterButton";
import { FitToggle } from "./FitToggle";
import { ListingCard } from "./ListingCard";
import { Button, EmptyState } from "./ui";

const RIGHT_LABEL = RIGHT_SWIPE_ACTION === "message" ? "Message" : "Save";
const RIGHT_ICON = RIGHT_SWIPE_ACTION === "message" ? "chatbubble-ellipses" : "bookmark";
const THRESHOLD = 110;

export function SwipeDeck() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const { listings, filters, setFilters, seen, markSeen, unmarkSeen, resetDeck, shortlist, save, unsave, startChat, prefs, showAll, setShowAll } = useStore();
  const [history, setHistory] = useState<{ id: string; saved: boolean }[]>([]);
  const [busy, setBusy] = useState(false);

  // Best roommate fit first (not newest first). Poor fits are hidden until "Show all".
  const ranked = useMemo(() => rankByFit(filterListings(listings, filters).filter((l) => l.sublessor.id !== "me"), prefs, showAll), [listings, filters, prefs, showAll]);
  const matches = ranked.listings;
  const queue = useMemo(() => matches.filter((l) => !seen.includes(l.id)), [matches, seen]);
  const top: Listing | undefined = queue[0];
  const next: Listing | undefined = queue[1];

  const x = useSharedValue(0);

  const commit = useCallback(
    (dir: 1 | -1) => {
      if (!top) return;
      haptic();
      markSeen(top.id);
      if (dir === -1) {
        setHistory((h) => [...h, { id: top.id, saved: false }]);
      } else if (RIGHT_SWIPE_ACTION === "message") {
        router.push(`/chat/${startChat(top.id)}`);
      } else {
        const wasSaved = shortlist.includes(top.id);
        save(top.id);
        setHistory((h) => [...h, { id: top.id, saved: !wasSaved }]);
      }
      x.value = 0;
      setBusy(false);
    },
    [top, markSeen, startChat, shortlist, save, x],
  );

  const fling = useCallback(
    (dir: 1 | -1) => {
      if (!top || busy) return;
      setBusy(true);
      x.value = withTiming(dir * width * 1.3, { duration: 220 }, (finished) => {
        if (finished) scheduleOnRN(commit, dir);
      });
    },
    [top, busy, width, x, commit],
  );

  const pan = Gesture.Pan()
    .enabled(!!top && !busy)
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > THRESHOLD || Math.abs(e.velocityX) > 900) {
        const dir = e.translationX > 0 ? 1 : -1;
        x.value = withTiming(dir * width * 1.3, { duration: 200 }, (finished) => {
          if (finished) scheduleOnRN(commit, dir);
        });
      } else {
        x.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: `${interpolate(x.value, [-width, 0, width], [-12, 0, 12])}deg` }],
  }));
  const nextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(Math.abs(x.value), [0, width / 2], [0.94, 1], "clamp") }, { translateY: interpolate(Math.abs(x.value), [0, width / 2], [14, 0], "clamp") }],
  }));
  const rightStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [20, 120], [0, 1], "clamp") }));
  const leftStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-120, -20], [1, 0], "clamp") }));

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    haptic();
    setHistory((h) => h.slice(0, -1));
    unmarkSeen(last.id);
    if (last.saved) unsave(last.id);
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 }}>
        <Text style={{ color: c.muted, fontSize: 14 }}>{top ? `${queue.length} ${queue.length === 1 ? "place" : "places"} to go` : "Discover"}</Text>
        <FilterButton />
      </View>

      <View style={{ paddingBottom: 10 }}>
        <FitToggle hidden={ranked.hidden} />
      </View>

      <View style={{ flex: 1 }}>
        {top ? (
          <>
            {next && (
              <Animated.View key={next.id} pointerEvents="none" style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, nextStyle]}>
                <ListingCard listing={next} />
              </Animated.View>
            )}
            <GestureDetector gesture={pan}>
              <Animated.View key={top.id} style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, topStyle]}>
                <ListingCard listing={top} interactive onOpen={() => router.push(`/listing/${top.id}`)} />
                <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 110, left: 20, transform: [{ rotate: "-8deg" }] }, rightStamp]}>
                  <Text style={{ borderWidth: 3, borderColor: "#10b981", color: "#059669", backgroundColor: "rgba(255,255,255,0.88)", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, fontSize: 26, fontWeight: "800", overflow: "hidden" }}>
                    {RIGHT_LABEL.toUpperCase()}
                  </Text>
                </Animated.View>
                <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 110, right: 20, transform: [{ rotate: "8deg" }] }, leftStamp]}>
                  <Text style={{ borderWidth: 3, borderColor: "#9ca3af", color: "#6b7280", backgroundColor: "rgba(255,255,255,0.88)", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, fontSize: 26, fontWeight: "800", overflow: "hidden" }}>
                    PASS
                  </Text>
                </Animated.View>
              </Animated.View>
            </GestureDetector>
          </>
        ) : (
          <EmptyState
            title={matches.length > 0 ? COPY.empty.deckDone.title : ranked.hidden > 0 ? COPY.empty.weakFits.title : COPY.empty.noMatches.title}
            body={matches.length > 0 ? COPY.empty.deckDone.body : ranked.hidden > 0 ? COPY.empty.weakFits.body(ranked.hidden) : COPY.empty.noMatches.body}
            action={
              matches.length > 0 ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button
                    title="Start over"
                    onPress={() => {
                      resetDeck();
                      setHistory([]);
                    }}
                  />
                  <Button title="Browse list" variant="outline" onPress={() => router.navigate("/browse")} />
                </View>
              ) : ranked.hidden > 0 ? (
                <Button title="Show all" onPress={() => setShowAll(true)} />
              ) : (
                <Button title="Clear filters" onPress={() => setFilters(DEFAULT_FILTERS)} />
              )
            }
          />
        )}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14 }}>
        <Button icon="arrow-undo" variant="outline" disabled={history.length === 0} onPress={undo} style={{ width: 52, height: 52, paddingHorizontal: 0 }} />
        <Button title="Pass" icon="close" variant="outline" size="lg" disabled={!top || busy} onPress={() => fling(-1)} style={{ flex: 1 }} />
        <Button title={RIGHT_LABEL} icon={RIGHT_ICON} size="lg" disabled={!top || busy} onPress={() => fling(1)} style={{ flex: 1 }} />
      </View>
      {seen.length === 0 && top ? (
        <Text style={{ textAlign: "center", color: c.muted, fontSize: 12, paddingTop: 10 }}>
          Swipe right to {RIGHT_LABEL.toLowerCase()}, left to pass. Tap the photo for more pictures.
        </Text>
      ) : null}
    </View>
  );
}
