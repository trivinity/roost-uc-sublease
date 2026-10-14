import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { walkMinutes } from "@/lib/geo";
import { BUS_STOPS, NEARBY_MAX_MILES, nearestStop, SHUTTLE_STOPS, type NearestStop } from "@/lib/transit";
import { useColors } from "@/lib/theme";
import type { Listing } from "@/lib/types";
import { Card } from "./ui";

function Row({ icon, kind, near }: { icon: "bus-outline" | "train-outline"; kind: string; near: NearestStop | null }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.soft, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={18} color={c.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.muted, fontSize: 12 }}>{kind}</Text>
        {near ? (
          <Text style={{ color: c.ink, fontSize: 14, fontWeight: "500" }}>
            {near.stop.name}
            <Text style={{ color: c.muted, fontWeight: "400" }}>
              {" "}
              · {near.miles.toFixed(1)} mi{near.miles <= NEARBY_MAX_MILES ? ` · ${walkMinutes(near.miles)} min walk` : ""}
            </Text>
          </Text>
        ) : (
          <Text style={{ color: c.muted, fontSize: 14 }}>No stop on file</Text>
        )}
      </View>
    </View>
  );
}

// Nearest UC shuttle stop and Metro bus stop. The stop lists live in lib/transit.ts (sample data for now).
export function GettingAround({ listing }: { listing: Pick<Listing, "lat" | "lng"> }) {
  const c = useColors();
  return (
    <Card style={{ padding: 16, gap: 14 }}>
      <Text style={{ color: c.ink, fontSize: 15, fontWeight: "600" }}>Getting around</Text>
      <Row icon="train-outline" kind="Nearest UC shuttle stop" near={nearestStop(SHUTTLE_STOPS, listing)} />
      <Row icon="bus-outline" kind="Nearest Metro bus stop" near={nearestStop(BUS_STOPS, listing)} />
    </Card>
  );
}
