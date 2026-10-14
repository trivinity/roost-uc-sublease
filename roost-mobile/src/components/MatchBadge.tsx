import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { matchTone } from "@/lib/roommates";

export function MatchBadge({ score, style }: { score: number; style?: StyleProp<ViewStyle> }) {
  const tone = matchTone(score);
  const bg = tone === "great" ? "#10b981" : tone === "good" ? "#fbbf24" : "#737373";
  const fg = tone === "good" ? "#451a03" : "#fff";
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: "flex-start" }, style]}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: "700" }}>{score}% match</Text>
    </View>
  );
}
