import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { AMENITY_LABEL } from "@/lib/amenities";
import { haptic } from "@/lib/haptics";
import { useColors } from "@/lib/theme";
import type { AmenityId } from "@/lib/types";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
export const AMENITY_ICONS: Record<AmenityId, IconName> = {
  laundry: "washing-machine",
  wifi: "wifi",
  bed: "bed",
  parking: "parking",
  utilities: "flash",
  elevator: "elevator",
  security: "shield-check",
  gym: "dumbbell",
  dishwasher: "dishwasher",
  ac: "snowflake",
  bike: "bike",
  rooftop: "weather-sunset-up",
  outdoor: "tree",
  pets: "paw",
  kitchen: "chef-hat",
};

// Amenities as small round icons. Tap one to see its name (there is no hover on a phone).
// Inside a pressable card pass interactive={false}.
export function AmenityIcons({ ids, max, size = 38, interactive = true }: { ids: AmenityId[]; max?: number; size?: number; interactive?: boolean }) {
  const c = useColors();
  const [open, setOpen] = useState<AmenityId | null>(null);
  const shown = max ? ids.slice(0, max) : ids;
  const extra = max ? ids.length - shown.length : 0;

  const face = { width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, alignItems: "center", justifyContent: "center" } as const;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }} accessibilityLabel="Amenities">
        {shown.map((id) =>
          interactive ? (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={AMENITY_LABEL[id]}
              onPress={() => {
                haptic();
                setOpen(open === id ? null : id);
              }}
              style={[face, open === id && { borderColor: c.brand }]}
            >
              <MaterialCommunityIcons name={AMENITY_ICONS[id]} size={size * 0.5} color={open === id ? c.brandText : c.muted} />
            </Pressable>
          ) : (
            <View key={id} accessible accessibilityLabel={AMENITY_LABEL[id]} style={face}>
              <MaterialCommunityIcons name={AMENITY_ICONS[id]} size={size * 0.5} color={c.muted} />
            </View>
          ),
        )}
        {extra > 0 && (
          <View style={[face, { backgroundColor: c.soft, borderWidth: 0 }]}>
            <Text style={{ color: c.muted, fontSize: 12, fontWeight: "600" }}>+{extra}</Text>
          </View>
        )}
      </View>
      {open && <Text style={{ color: c.ink, fontSize: 13, fontWeight: "500" }}>{AMENITY_LABEL[open]}</Text>}
    </View>
  );
}
