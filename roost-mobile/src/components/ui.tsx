import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { haptic } from "@/lib/haptics";
import { distanceBand, fmtMiles } from "@/lib/format";
import { BAND_COLORS, useColors } from "@/lib/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function Pill({ children, bg, color, style }: { children: ReactNode; bg?: string; color?: string; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[{ backgroundColor: bg ?? c.soft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: "flex-start" }, style]}>
      <Text style={{ color: color ?? c.ink, fontSize: 12, fontWeight: "500" }}>{children}</Text>
    </View>
  );
}

// Area name plus distance from UC, colored by how far it is.
export function AreaPill({ area, miles }: { area: string; miles: number }) {
  const c = useColors();
  const [bg, fg] = BAND_COLORS[c.dark ? "dark" : "light"][distanceBand(miles)];
  return (
    <Pill bg={bg} color={fg}>
      {fmtMiles(miles)} · {area}
    </Pill>
  );
}

export function Freshness({ label, tone }: { label: string; tone: "good" | "ok" | "stale" }) {
  const c = useColors();
  const dot = { good: "#10b981", ok: "#f59e0b", stale: "#a8a29e" }[tone];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot }} />
      <Text style={{ color: c.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  style,
  size = "md",
}: {
  title?: string;
  onPress?: () => void;
  variant?: "primary" | "outline" | "ghost";
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: "sm" | "md" | "lg";
}) {
  const c = useColors();
  const height = { sm: 36, md: 44, lg: 52 }[size];
  const fg = variant === "primary" ? c.onBrand : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={() => {
        haptic();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          height,
          paddingHorizontal: size === "sm" ? 14 : 20,
          borderRadius: 99,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        variant === "primary" && { backgroundColor: c.brand },
        variant === "outline" && { borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Ionicons name={icon} size={size === "lg" ? 20 : 18} color={fg} /> : null}
      {title ? <Text style={{ color: fg, fontSize: size === "sm" ? 13 : 15, fontWeight: "600" }}>{title}</Text> : null}
    </Pressable>
  );
}

export function Chip({ label, active, onPress, style }: { label: string; active: boolean; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => {
        haptic();
        onPress();
      }}
      style={[
        {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 99,
          borderWidth: 1,
          borderColor: active ? c.brand : c.border,
          backgroundColor: active ? c.brand : c.card,
        },
        style,
      ]}
    >
      <Text style={{ color: active ? c.onBrand : c.ink, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[{ flex: 1, backgroundColor: c.bg }, style]}>{children}</View>;
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return <Text style={[{ fontSize: 28, fontWeight: "700", letterSpacing: -0.6, color: c.ink }, style]}>{children}</Text>;
}

export function Muted({ children, style, numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  const c = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: 14, color: c.muted }, style]}>
      {children}
    </Text>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  const c = useColors();
  return (
    <View style={[styles.empty, { borderColor: c.border }]}>
      <Text style={{ fontSize: 17, fontWeight: "600", color: c.ink, textAlign: "center" }}>{title}</Text>
      {body ? <Text style={{ fontSize: 14, color: c.muted, textAlign: "center", marginTop: 6, maxWidth: 260 }}>{body}</Text> : null}
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.card, borderRadius: 24, borderWidth: 1, borderColor: c.border }, shadow, style]}>{children}</View>;
}

export const shadow: ViewStyle = {
  shadowColor: "#3c1e14",
  shadowOpacity: 0.12,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
};

const styles = StyleSheet.create({
  empty: { borderWidth: 1, borderStyle: "dashed", borderRadius: 28, padding: 32, alignItems: "center", justifyContent: "center" },
});
