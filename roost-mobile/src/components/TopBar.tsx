import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

// Logo on the left, account on the right. Every tab screen is wrapped in <Frame>.
export function Frame({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const { user } = useStore();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ height: 52, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: c.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: c.brand }} />
          <Text style={{ fontSize: 20, fontWeight: "700", letterSpacing: -0.5, color: c.ink }}>Roost</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account"
          onPress={() => router.push("/account")}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.brand, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>{user?.name.charAt(0).toUpperCase() ?? "R"}</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
