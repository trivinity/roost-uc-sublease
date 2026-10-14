import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { Photo } from "@/components/Photo";
import { Frame } from "@/components/TopBar";
import { H1 } from "@/components/ui";
import { COPY } from "@/lib/copy";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

export default function Messages() {
  const c = useColors();
  const { threads, getListing } = useStore();
  const visible = threads.filter((t) => t.messages.length > 0);

  return (
    <Frame>
      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        ListHeaderComponent={<H1 style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>Messages</H1>}
        ListEmptyComponent={<Text style={{ color: c.muted, paddingHorizontal: 20, paddingTop: 8 }}>{COPY.empty.inbox}</Text>}
        renderItem={({ item: t }) => {
          const l = getListing(t.listingId);
          if (!l) return null;
          const last = t.messages[t.messages.length - 1];
          return (
            <Pressable
              onPress={() => router.push(`/chat/${t.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Chat with ${l.sublessor.name}${t.unread ? ", unread" : ""}`}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: pressed ? c.soft : "transparent" })}
            >
              <View style={{ width: 54, height: 54, borderRadius: 27, overflow: "hidden" }}>
                <Photo listing={l} style={{ flex: 1 }} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 16, fontWeight: t.unread ? "700" : "600", color: c.ink }}>{l.sublessor.name}</Text>
                  <Text style={{ fontSize: 12, color: c.muted }}>{last?.time}</Text>
                </View>
                <Text numberOfLines={1} style={{ fontSize: 12, color: c.muted }}>
                  {l.title}
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 15, color: t.unread ? c.ink : c.muted }}>
                  {last?.text}
                </Text>
              </View>
              {t.unread && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#3b82f6" }} />}
            </Pressable>
          );
        }}
      />
    </Frame>
  );
}
