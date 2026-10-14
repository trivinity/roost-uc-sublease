import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import { haptic } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

// Best fits first by default; "Show all" also reveals poor roommate fits. Without preferences it offers to set them.
export function FitToggle({ hidden }: { hidden: number }) {
  const c = useColors();
  const { prefs, showAll, setShowAll } = useStore();
  const pill = { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99 } as const;

  if (!prefs) {
    return (
      <Pressable onPress={() => router.push("/preferences")} style={[pill, { backgroundColor: c.soft }]} accessibilityRole="button">
        <Ionicons name="sparkles" size={14} color={c.brandText} />
        <Text style={{ color: c.brandText, fontSize: 12, fontWeight: "600" }}>Rank by roommate fit</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: showAll }}
      onPress={() => {
        haptic();
        setShowAll(!showAll);
      }}
      style={[pill, { backgroundColor: showAll ? c.card : c.soft, borderWidth: 1, borderColor: showAll ? c.border : "transparent" }]}
    >
      <Ionicons name="sparkles" size={14} color={showAll ? c.muted : c.brandText} />
      <Text style={{ color: showAll ? c.muted : c.brandText, fontSize: 12, fontWeight: "600" }}>
        {showAll ? "Showing all · Best fits only" : hidden > 0 ? `Best fits first · ${hidden} hidden · Show all` : "Best fits first"}
      </Text>
    </Pressable>
  );
}
