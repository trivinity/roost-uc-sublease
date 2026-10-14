import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Photo } from "@/components/Photo";
import { Button, Muted } from "@/components/ui";
import { COPY } from "@/lib/copy";
import { fmtMoney, fmtRange } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

const QUICK = ["Is it still available?", "Can I tour this week?", "Does your landlord allow subletting?", "Is the rent negotiable?"];

export default function Chat() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { threads, getListing, markRead, sendMessage, shareContact, user, typingThread } = useStore();
  const thread = threads.find((t) => t.id === id);
  const l = thread ? getListing(thread.listingId) : undefined;
  const first = l?.sublessor.name.split(" ")[0] ?? "them";
  const [draft, setDraft] = useState(() =>
    thread && thread.messages.length === 0 && l ? `Hi ${first}! Is your ${l.neighborhood} place still available for ${fmtRange(l.startDate, l.endDate)}?` : "",
  );
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    if (thread?.unread) markRead(thread.id);
  }, [thread?.unread, thread?.id, markRead]);

  if (!thread || !l) return null;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    haptic();
    sendMessage(thread.id, text);
    setDraft("");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <Pressable accessibilityLabel="Back" hitSlop={8} onPress={() => router.back()} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={c.ink} />
        </Pressable>
        <Pressable onPress={() => router.push(`/listing/${l.id}`)} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, overflow: "hidden" }}>
            <Photo listing={l} style={{ flex: 1 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{l.sublessor.name}</Text>
            <Muted numberOfLines={1} style={{ fontSize: 12 }}>
              {l.title} · {fmtMoney(l.rent)}/mo
            </Muted>
          </View>
        </Pressable>
      </View>

      {/* contact info stays hidden until each side chooses to share */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: c.soft, gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            <Ionicons name={thread.myContactShared ? "call-outline" : "lock-closed-outline"} size={16} color={c.muted} />
            <Muted style={{ flex: 1 }}>{thread.myContactShared ? `You shared ${user?.email}` : "Your contact info is hidden"}</Muted>
          </View>
          {!thread.myContactShared && <Button title="Share mine" size="sm" variant="outline" onPress={() => shareContact(thread.id)} />}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name={thread.theirContactShared ? "call-outline" : "eye-off-outline"} size={16} color={c.muted} />
          <Text style={{ color: thread.theirContactShared ? c.ink : c.muted, fontSize: 14, flex: 1 }}>
            {thread.theirContactShared ? `${first.toLowerCase()}@mail.uc.edu · (513) 555-0187` : `${first}'s contact info is hidden until they share it`}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}>
          {thread.messages.length === 0 && <Muted style={{ textAlign: "center", paddingTop: 32 }}>{COPY.empty.startChat}</Muted>}
          {thread.messages.map((m) =>
            m.from === "system" ? (
              <Muted key={m.id} style={{ textAlign: "center", fontSize: 12, paddingVertical: 4 }}>
                {m.text}
              </Muted>
            ) : (
              <View key={m.id} style={{ alignItems: m.from === "me" ? "flex-end" : "flex-start" }}>
                <Text
                  style={{
                    maxWidth: "80%",
                    overflow: "hidden",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 22,
                    fontSize: 16,
                    lineHeight: 21,
                    backgroundColor: m.from === "me" ? c.brand : c.soft,
                    color: m.from === "me" ? "#fff" : c.ink,
                  }}
                >
                  {m.text}
                </Text>
              </View>
            ),
          )}
          {typingThread === thread.id && (
            <View style={{ alignSelf: "flex-start", backgroundColor: c.soft, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", gap: 5 }}>
              {[0, 1, 2].map((d) => (
                <View key={d} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.muted, opacity: 0.4 + d * 0.25 }} />
              ))}
            </View>
          )}
        </ScrollView>

        {!draft && thread.messages.length < 6 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingTop: 8 }} style={{ flexGrow: 0 }}>
            {QUICK.map((q) => (
              <Pressable key={q} onPress={() => setDraft(q)} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 }}>
                <Text style={{ color: c.muted, fontSize: 14 }}>{q}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 12 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={c.muted}
            returnKeyType="send"
            onSubmitEditing={send}
            accessibilityLabel="Message"
            style={{ flex: 1, height: 46, borderRadius: 23, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, paddingHorizontal: 18, fontSize: 16, color: c.ink }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            disabled={!draft.trim()}
            onPress={send}
            style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.brand, opacity: draft.trim() ? 1 : 0.45, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
