/* eslint-disable react-hooks/immutability -- Reanimated shared values are meant to be assigned to (`x.value = ...`) */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { haptic } from "@/lib/haptics";
import { useStore } from "@/lib/store";

// Round bookmark that sits on photos. Pops when you save.
export function SaveButton({ id, style }: { id: string; style?: StyleProp<ViewStyle> }) {
  const { shortlist, toggleSave } = useStore();
  const saved = shortlist.includes(id);
  const pop = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? "Remove from shortlist" : "Save to shortlist"}
      accessibilityState={{ selected: saved }}
      hitSlop={8}
      onPress={() => {
        haptic();
        pop.value = withSequence(withSpring(1.35, { damping: 6 }), withSpring(1));
        toggleSave(id);
      }}
    >
      <Animated.View
        style={[
          { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
          anim,
          style,
        ]}
      >
        <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={19} color={saved ? "#d0312d" : "#1c1917"} />
      </Animated.View>
    </Pressable>
  );
}
