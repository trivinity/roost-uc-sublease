import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { fmtMiles } from "@/lib/format";
import { milesFromUC } from "@/lib/geo";
import { useColors } from "@/lib/theme";

export interface Place {
  label: string;
  area: string;
  lat: number;
  lng: number;
}

// The phone app asks the same address-lookup endpoint the website uses (OpenStreetMap, no API key).
const API = process.env.EXPO_PUBLIC_API_URL ?? "https://roost-uc-sublease.vercel.app";

// If the lookup can't find an address, the student can pick the nearest area instead (approximate centers).
const AREAS: Place[] = [
  { label: "Uptown", area: "Uptown", lat: 39.1315, lng: -84.5175 },
  { label: "Clifton", area: "Clifton", lat: 39.1412, lng: -84.5215 },
  { label: "Corryville", area: "Corryville", lat: 39.1345, lng: -84.5105 },
  { label: "Over-the-Rhine", area: "Over-the-Rhine", lat: 39.1125, lng: -84.5148 },
  { label: "Northside", area: "Northside", lat: 39.1745, lng: -84.544 },
  { label: "Norwood", area: "Norwood", lat: 39.159, lng: -84.454 },
  { label: "Oakley", area: "Oakley", lat: 39.1517, lng: -84.4351 },
];

export function AddressField({ value, place, onChange, error }: { value: string; place: Place | null; onChange: (text: string, place: Place | null) => void; error?: string }) {
  const c = useColors();
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const seq = useRef(0);

  // look up as they type (waits 600 ms after the last key to stay polite to the free service)
  useEffect(() => {
    if (place || value.trim().length < 5) return;
    const mine = ++seq.current;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/geocode?q=${encodeURIComponent(value)}`);
        const data = (await res.json()) as { results: Place[]; error?: string };
        if (mine !== seq.current) return;
        setResults(data.results);
        setFailed(!!data.error || data.results.length === 0);
      } catch {
        if (mine === seq.current) setFailed(true);
      } finally {
        if (mine === seq.current) setLoading(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [value, place]);

  const typed = value.trim().length >= 5;
  return (
    <View style={{ gap: 8 }}>
      <View>
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t, null)}
          placeholder="Start typing the street address"
          placeholderTextColor={c.muted}
          autoCorrect={false}
          accessibilityLabel="Street address"
          style={{ height: 50, borderRadius: 16, borderWidth: 1, borderColor: error && !place ? "#ef4444" : c.border, backgroundColor: c.card, paddingHorizontal: 16, paddingRight: 44, fontSize: 16, color: c.ink }}
        />
        <View style={{ position: "absolute", right: 14, top: 15 }}>
          {loading ? <ActivityIndicator size="small" color={c.muted} /> : place ? <Ionicons name="checkmark-circle" size={20} color={c.good} /> : <Ionicons name="location-outline" size={20} color={c.muted} />}
        </View>
      </View>

      {!place && typed && results.length > 0 && (
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 16, backgroundColor: c.popover, overflow: "hidden" }}>
          {results.map((r, i) => (
            <Pressable key={`${r.lat},${r.lng}`} onPress={() => onChange(r.label, r)} style={{ padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
              <Text style={{ color: c.ink, fontSize: 15 }}>{r.label}</Text>
              <Text style={{ color: c.muted, fontSize: 12 }}>{fmtMiles(milesFromUC(r.lat, r.lng))} from UC</Text>
            </Pressable>
          ))}
        </View>
      )}

      {place && (
        <Text style={{ color: c.good, fontSize: 14 }}>
          ✓ {fmtMiles(milesFromUC(place.lat, place.lng))} from UC (straight line) · {place.area}
        </Text>
      )}
      {error && !place ? <Text style={{ color: "#ef4444", fontSize: 13 }}>{error}</Text> : null}

      {!place && failed && !loading && typed && (
        <View style={{ backgroundColor: c.soft, borderRadius: 16, padding: 12, gap: 8 }}>
          <Text style={{ color: c.muted, fontSize: 13 }}>We couldn&apos;t find that address. Add the city and ZIP, or pick the nearest area (distance will be approximate):</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {AREAS.map((a) => (
              <Pressable key={a.area} onPress={() => onChange(value, a)} style={{ borderWidth: 1, borderColor: c.border, backgroundColor: c.card, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: c.ink, fontSize: 13 }}>{a.area}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
