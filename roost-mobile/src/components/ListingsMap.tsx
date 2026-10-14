import { router } from "expo-router";
import { Text, View } from "react-native";
import MapView, { Callout, Circle, Marker } from "react-native-maps";
import { DISTANCE_ANY } from "@/lib/filters";
import { fmtMiles, fmtMoney } from "@/lib/format";
import { UC_CENTER } from "@/lib/geo";
import { useColors } from "@/lib/theme";
import type { Listing } from "@/lib/types";

const NEAR_MILES = 6;

// Map of listings: a price pin each, UC in red, and the distance limit drawn as a circle.
export function ListingsMap({ listings, maxDistance }: { listings: Listing[]; maxDistance: number }) {
  const c = useColors();
  const near = listings.filter((l) => l.distanceMiles <= NEAR_MILES);
  const framed = near.length > 0 ? near : listings;
  const radius = maxDistance < DISTANCE_ANY ? maxDistance : null;
  const farther = listings.length - framed.length;

  return (
    <View style={{ height: 520, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: c.border }}>
      <MapView
        style={{ flex: 1 }}
        userInterfaceStyle={c.dark ? "dark" : "light"}
        initialRegion={{ latitude: UC_CENTER.lat, longitude: UC_CENTER.lng, latitudeDelta: radius ? radius / 24 : 0.14, longitudeDelta: radius ? radius / 24 : 0.14 }}
      >
        {radius && <Circle center={{ latitude: UC_CENTER.lat, longitude: UC_CENTER.lng }} radius={radius * 1609.34} strokeColor="#d0312d" fillColor="rgba(208,49,45,0.06)" />}
        <Marker coordinate={{ latitude: UC_CENTER.lat, longitude: UC_CENTER.lng }} title="UC" pinColor="#d0312d" />
        {listings.map((l) => (
          <Marker key={l.id} coordinate={{ latitude: l.lat, longitude: l.lng }} onCalloutPress={() => router.push(`/listing/${l.id}`)}>
            <View style={{ backgroundColor: "#fff", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}>
              <Text style={{ color: "#2a1f1d", fontWeight: "700", fontSize: 12 }}>{fmtMoney(l.rent)}</Text>
            </View>
            <Callout>
              <View style={{ minWidth: 160 }}>
                <Text style={{ fontWeight: "700" }}>{l.title}</Text>
                <Text>
                  {fmtMoney(l.rent)}/mo · {fmtMiles(l.distanceMiles)} from UC
                </Text>
                <Text style={{ color: "#d0312d" }}>Tap to view →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {farther > 0 && (
        <Text style={{ position: "absolute", top: 10, left: 10, backgroundColor: c.bg, color: c.ink, fontSize: 12, fontWeight: "600", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, overflow: "hidden" }}>
          +{farther} farther out · zoom out to see {farther === 1 ? "it" : "them"}
        </Text>
      )}
    </View>
  );
}
