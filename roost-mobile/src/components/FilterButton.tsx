import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { activeFilterCount } from "@/lib/filters";
import { haptic } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import { FilterSheet } from "./FilterSheet";

export function FilterButton() {
  const c = useColors();
  const { filters } = useStore();
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(filters);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open filters"
        onPress={() => {
          haptic();
          setOpen(true);
        }}
        style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 16, borderRadius: 99, borderWidth: 1, borderColor: c.border, backgroundColor: c.card }}
      >
        <Ionicons name="options-outline" size={17} color={c.ink} />
        <Text style={{ color: c.ink, fontSize: 14, fontWeight: "600" }}>Filters</Text>
        {count > 0 && (
          <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: c.brand, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{count}</Text>
          </View>
        )}
      </Pressable>
      <FilterSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
