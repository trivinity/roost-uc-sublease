import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { haptic } from "@/lib/haptics";
import type { TraitDef } from "@/lib/roommates";
import { useColors } from "@/lib/theme";

// A row of steps from low to high (1..N). Shows the name of the chosen step.
export function RatingScale({ def, value, onChange, label }: { def: TraitDef; value: number; onChange: (v: number) => void; label?: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ color: c.ink, fontSize: 15, fontWeight: "600" }}>{label ?? def.label}</Text>
        <Text style={{ color: c.brandText, fontSize: 14 }}>{def.levels[value - 1]}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 6 }} accessibilityRole="radiogroup">
        {def.levels.map((name, i) => (
          <Pressable
            key={name}
            accessibilityRole="radio"
            accessibilityLabel={name}
            accessibilityState={{ checked: i + 1 === value }}
            hitSlop={{ top: 12, bottom: 12 }}
            onPress={() => {
              haptic();
              onChange(i + 1);
            }}
            style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: i + 1 <= value ? c.brand : c.soft }}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: c.muted, fontSize: 12 }}>{def.levels[0]}</Text>
        <Text style={{ color: c.muted, fontSize: 12 }}>{def.levels[def.levels.length - 1]}</Text>
      </View>
    </View>
  );
}

export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: string }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => {
        haptic();
        onChange(!checked);
      }}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}
    >
      <Ionicons name={checked ? "checkbox" : "square-outline"} size={22} color={checked ? c.brand : c.muted} />
      <Text style={{ color: c.ink, fontSize: 15, flex: 1 }}>{children}</Text>
    </Pressable>
  );
}
