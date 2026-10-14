import { Text } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

export function Toast() {
  const { toast } = useStore();
  const c = useColors();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <Animated.View
      key={toast}
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={{ position: "absolute", top: insets.top + 8, left: 0, right: 0, alignItems: "center", zIndex: 100 }}
    >
      <Text
        style={{ backgroundColor: c.ink, color: c.bg, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99, overflow: "hidden", fontSize: 14, fontWeight: "500" }}
      >
        {toast}
      </Text>
    </Animated.View>
  );
}
