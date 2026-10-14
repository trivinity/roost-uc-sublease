import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Share, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Photo } from "@/components/Photo";
import { Button, Card, EmptyState, Freshness, HoodPill, Muted } from "@/components/ui";
import { COPY } from "@/lib/copy";
import { bedroomLabel, fmtMiles, fmtMoney, fmtRange, freshness, monthsBetween, TRANSFER_LABEL, UNIT_LABEL } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { priceInsight } from "@/lib/insights";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

const REASONS = ["Looks like a scam or fake listing", "No longer available", "Details don't match the listing", "Landlord doesn't allow subletting", "Something else"];

export default function ListingScreen() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { listings, getListing, shortlist, toggleSave, startChat, sendMessage, reported, report } = useStore();
  const [slide, setSlide] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");

  const l = getListing(id);
  if (!l) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", padding: 24 }}>
        <EmptyState title={COPY.empty.notFound.title} body={COPY.empty.notFound.body} action={<Button title="Back to browse" onPress={() => router.replace("/browse")} />} />
      </SafeAreaView>
    );
  }

  const f = freshness(l.confirmedDaysAgo);
  const insight = priceInsight(l, listings);
  const saved = shortlist.includes(l.id);
  const mine = l.sublessor.id === "me";
  const street = l.address.replace(/^\d+\s/, "");
  const isReported = reported.includes(l.id);

  const message = () => router.push(`/chat/${startChat(l.id)}`);
  const ask = () => {
    const tid = startChat(l.id);
    sendMessage(tid, "Hi! Is this still available?");
    router.push(`/chat/${tid}`);
  };

  const fields: [string, string][] = [
    ["Rent", `${fmtMoney(l.rent)}/mo`],
    ["Utilities", l.utilitiesIncluded ? "Included in rent" : `About ${fmtMoney(l.utilitiesEstimate)}/mo extra`],
    ["Dates", fmtRange(l.startDate, l.endDate, true)],
    ["Length", `${monthsBetween(l.startDate, l.endDate)} months`],
    ["Unit", `${UNIT_LABEL[l.unitType]} · ${bedroomLabel(l.bedrooms)} in unit`],
    ["Furnished", l.furnished ? "Yes" : "No"],
    ["Lease transfer", TRANSFER_LABEL[l.transferType]],
    ["Location", `${street}, ${l.neighborhood}`],
    ["To campus", `${fmtMiles(l.distanceMiles)} from UC`],
    ["Landlord consent", l.landlordConsent ? "Sublessor confirms their lease allows this" : "Not confirmed"],
  ];

  const tone = insight?.tone;
  const insightBg = tone === "great" ? (c.dark ? "rgba(52,211,153,0.15)" : "#d1fae5") : tone === "high" ? (c.dark ? "rgba(251,191,36,0.15)" : "#fef3c7") : c.soft;
  const insightFg = tone === "great" ? (c.dark ? "#6ee7b7" : "#065f46") : tone === "high" ? (c.dark ? "#fcd34d" : "#78350f") : c.muted;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View>
          <FlatList
            data={l.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p, i) => `${p}-${i}`}
            onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ index }) => (
              <View style={{ width, height: 320 + insets.top * 0.4 }}>
                <Photo listing={l} index={index} style={{ flex: 1 }} />
              </View>
            )}
          />
          <View style={{ position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 }} pointerEvents="none">
            {l.photos.map((_, i) => (
              <View key={i} style={{ height: 6, width: i === slide ? 18 : 6, borderRadius: 3, backgroundColor: i === slide ? "#fff" : "rgba(255,255,255,0.6)" }} />
            ))}
          </View>
          <View style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" }}>
            <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={22} color="#1c1917" />
            </Pressable>
            <Pressable
              accessibilityLabel="Share"
              onPress={() => Share.share({ message: `${l.title} · ${fmtMoney(l.rent)}/mo · ${l.neighborhood} (on Roost)` }).catch(() => {})}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="share-outline" size={20} color="#1c1917" />
            </Pressable>
          </View>
        </View>
        <Muted style={{ textAlign: "center", fontSize: 11, paddingTop: 8 }}>Demo photos from Unsplash. They are not these actual units.</Muted>

        <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}>
          <Text style={{ fontSize: 32, fontWeight: "700", letterSpacing: -1, color: c.ink }}>
            {fmtMoney(l.rent)}
            <Text style={{ fontSize: 18, fontWeight: "400", color: c.muted }}>/mo</Text>
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "500", color: c.ink }}>{l.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <HoodPill hood={l.neighborhood} />
            <Muted>{fmtMiles(l.distanceMiles)} to campus</Muted>
          </View>
          {insight && (
            <View style={{ alignSelf: "flex-start", backgroundColor: insightBg, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text style={{ color: insightFg, fontSize: 12, fontWeight: "500" }}>{insight.label}</Text>
            </View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.soft, borderRadius: 18, padding: 14, marginTop: 8 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontWeight: "600", color: c.ink }}>Still available?</Text>
              <Freshness {...f} />
            </View>
            {!mine && <Button title="Ask" size="sm" variant="outline" onPress={ask} />}
          </View>

          <Text style={{ fontSize: 16, lineHeight: 24, color: c.ink, marginTop: 14 }}>{l.description}</Text>

          <Card style={{ paddingHorizontal: 18, marginTop: 14 }}>
            {fields.map(([k, v], i) => (
              <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
                <Text style={{ color: c.muted, fontSize: 14 }}>{k}</Text>
                <Text style={{ color: c.ink, fontSize: 14, fontWeight: "500", flex: 1, textAlign: "right" }}>{v}</Text>
              </View>
            ))}
          </Card>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {l.amenities.map((a) => (
              <View key={a} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }}>
                <Text style={{ color: c.muted, fontSize: 13 }}>{a}</Text>
              </View>
            ))}
          </View>

          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, marginTop: 10 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.brand, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>{l.sublessor.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", color: c.ink, fontSize: 16 }}>{l.sublessor.name}</Text>
              <Muted numberOfLines={1}>{l.sublessor.detail}</Muted>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="checkmark-circle" size={16} color={c.good} />
              <Text style={{ color: c.good, fontSize: 12, fontWeight: "600" }}>UC verified</Text>
            </View>
          </Card>
          <Muted style={{ fontSize: 12 }}>Contact info stays hidden until you both choose to share it in chat.</Muted>

          <View style={{ alignItems: "center", paddingTop: 8 }}>
            <Button title={isReported ? "Reported" : "Report listing"} icon="flag-outline" variant="ghost" size="sm" disabled={isReported} onPress={() => setReporting(true)} />
          </View>
        </View>
      </ScrollView>

      {/* sticky action bar */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 + insets.bottom, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: c.brandText, letterSpacing: -0.5 }}>
            {fmtMoney(l.rent)}
            <Text style={{ fontSize: 13, fontWeight: "400", color: c.muted }}>/mo</Text>
          </Text>
          <Muted style={{ fontSize: 12 }}>{fmtRange(l.startDate, l.endDate)}</Muted>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove from shortlist" : "Save to shortlist"}
          onPress={() => {
            haptic();
            toggleSave(l.id);
          }}
          style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color={saved ? c.brandText : c.ink} />
        </Pressable>
        {mine ? <Button title="Manage" size="lg" onPress={() => router.push("/account")} /> : <Button title="Message" icon="chatbubble-ellipses" size="lg" onPress={message} />}
      </View>

      {/* report sheet */}
      <Modal visible={reporting} animationType="slide" transparent onRequestClose={() => setReporting(false)}>
        <Pressable style={{ flex: 1, backgroundColor: c.dark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.35)" }} onPress={() => setReporting(false)} />
        <View style={{ backgroundColor: c.popover, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 20 + insets.bottom, gap: 6 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: c.ink, marginBottom: 4 }}>Report this listing</Text>
          <Muted>{COPY.report.prompt}</Muted>
          {REASONS.map((r) => (
            <Pressable key={r} onPress={() => setReason(r)} accessibilityRole="radio" accessibilityState={{ checked: reason === r }} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
              <Ionicons name={reason === r ? "radio-button-on" : "radio-button-off"} size={22} color={reason === r ? c.brand : c.muted} />
              <Text style={{ color: c.ink, fontSize: 15, flex: 1 }}>{r}</Text>
            </Pressable>
          ))}
          <Button
            title="Submit report"
            size="lg"
            disabled={!reason}
            onPress={() => {
              report(l.id);
              setReporting(false);
              setReason("");
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
