import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Text, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { RIGHT_SWIPE_ACTION } from "@/lib/config";
import { photoSource } from "@/lib/photos";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

const RIGHT = RIGHT_SWIPE_ACTION === "message" ? "message the sublessor" : "save it to your shortlist";

// Shown once, right after the first sign-in.
export default function Welcome() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const { finishOnboarding } = useStore();
  const list = useRef<FlatList>(null);
  const [i, setI] = useState(0);

  const slides = [
    {
      title: "Swipe to find your place",
      body: `Swipe right to ${RIGHT}, left to pass. Tap a photo to see more pictures.`,
      visual: (
        <View style={{ height: 230, width: 260, marginTop: 24 }}>
          {[
            { p: "/photos/living-2.jpg", rot: -12, x: -64, z: 1 },
            { p: "/photos/kitchen-4.jpg", rot: 12, x: 64, z: 1 },
            { p: "/photos/bedroom-1.jpg", rot: 0, x: 0, z: 2 },
          ].map((s) => (
            <Image key={s.p} source={photoSource(s.p as "/photos/living-2.jpg")} contentFit="cover" style={{ position: "absolute", top: 4, left: 60, width: 140, height: 200, borderRadius: 18, zIndex: s.z, transform: [{ translateX: s.x }, { rotate: `${s.rot}deg` }] }} />
          ))}
        </View>
      ),
    },
    {
      title: "Real students, real leases",
      body: "Everyone signs in with a UC email, and every listing confirms the lease allows subletting.",
      visual: (
        <View style={{ gap: 12, alignItems: "center" }}>
          <View style={{ width: 116, height: 116, borderRadius: 58, backgroundColor: c.brand, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="shield-checkmark" size={56} color="#fff" />
          </View>
          {["UC verified", "Landlord consent", "Confirmed this week"].map((t) => (
            <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 }}>
              <Ionicons name="checkmark-circle" size={16} color={c.good} />
              <Text style={{ color: c.ink, fontWeight: "500" }}>{t}</Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      title: "You choose what to share",
      body: "Your phone and email stay hidden until you decide to share them in a chat.",
      visual: (
        <View style={{ gap: 10, width: 270 }}>
          <View style={{ alignSelf: "flex-end", backgroundColor: c.brand, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
            <Text style={{ color: "#fff" }}>Is it still available?</Text>
          </View>
          <View style={{ alignSelf: "flex-start", backgroundColor: c.soft, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
            <Text style={{ color: c.ink }}>Yes! Want to tour this week?</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderStyle: "dashed", borderColor: c.border, backgroundColor: c.card, padding: 12, borderRadius: 16 }}>
            <Ionicons name="lock-closed" size={18} color={c.ink} />
            <View>
              <Text style={{ color: c.ink, fontWeight: "600" }}>Contact info hidden</Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>Share it only when you&apos;re ready</Text>
            </View>
          </View>
        </View>
      ),
    },
  ];
  const last = i === slides.length - 1;

  const done = () => {
    finishOnboarding();
    router.replace("/");
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setI(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ height: 48, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: c.brand }} />
          <Text style={{ fontSize: 20, fontWeight: "700", color: c.ink }}>Roost</Text>
        </View>
        <Button title="Skip" variant="ghost" size="sm" onPress={done} />
      </View>

      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(s) => s.title}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 36 }}>
            {item.visual}
            <View style={{ gap: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 26, fontWeight: "700", letterSpacing: -0.6, color: c.ink, textAlign: "center" }}>{item.title}</Text>
              <Text style={{ fontSize: 16, lineHeight: 23, color: c.muted, textAlign: "center", maxWidth: 300 }}>{item.body}</Text>
            </View>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: 24, paddingBottom: 12, gap: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {slides.map((s, n) => (
            <View key={s.title} style={{ height: 8, width: n === i ? 24 : 8, borderRadius: 4, backgroundColor: n === i ? c.brand : c.border }} />
          ))}
        </View>
        <Button
          title={last ? "Get started" : "Next"}
          size="lg"
          onPress={() => {
            if (last) done();
            else list.current?.scrollToIndex({ index: i + 1, animated: true });
          }}
        />
      </View>
    </SafeAreaView>
  );
}
