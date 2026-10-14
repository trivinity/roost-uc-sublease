import { Text, View } from "react-native";
import { useColors } from "@/lib/theme";

// react-native-maps is native only. The web preview of the phone app shows this note instead.
export function ListingsMap(_props: { listings: unknown[]; maxDistance: number }) {
  const c = useColors();
  return (
    <View style={{ height: 240, borderRadius: 24, borderWidth: 1, borderColor: c.border, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ color: c.muted, textAlign: "center" }}>The map shows on iPhone and Android (open the app in Expo Go).</Text>
    </View>
  );
}
