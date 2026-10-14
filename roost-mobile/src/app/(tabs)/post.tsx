import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { Frame } from "@/components/TopBar";
import { Button, Chip, H1, Muted } from "@/components/ui";
import { COPY } from "@/lib/copy";
import { TERMS } from "@/lib/filters";
import { milesFromUC } from "@/lib/geo";
import { TRANSFER_LABEL, TRANSFER_SHORT } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import type { Listing, TransferType, UnitType } from "@/lib/types";

// Simple version for now: pick the nearest area (approximate center). The web app looks up the exact address.
const AREAS: Record<string, { lat: number; lng: number }> = {
  Uptown: { lat: 39.1315, lng: -84.5175 },
  Clifton: { lat: 39.1412, lng: -84.5215 },
  Corryville: { lat: 39.1345, lng: -84.5105 },
  "Over-the-Rhine": { lat: 39.1125, lng: -84.5148 },
  Northside: { lat: 39.1745, lng: -84.544 },
  Norwood: { lat: 39.159, lng: -84.454 },
};
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>{label}</Text>
      {children}
      {error ? <Text style={{ color: "#ef4444", fontSize: 13 }}>{error}</Text> : null}
    </View>
  );
}

export default function Post() {
  const c = useColors();
  const { addListing, showToast } = useStore();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [hood, setHood] = useState<string>("Uptown");
  const [rent, setRent] = useState("");
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(true);
  const [utilities, setUtilities] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [furnished, setFurnished] = useState(false);
  const [unitType, setUnitType] = useState<UnitType>("room");
  const [transfer, setTransfer] = useState<TransferType>("sublease");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = COPY.post.title;
    if (!address.trim()) err.address = COPY.post.address;
    if (!(Number(rent) > 0)) err.rent = COPY.post.rent;
    if (!utilitiesIncluded && (utilities === "" || !(Number(utilities) >= 0))) err.utilities = COPY.post.utilities;
    if (!DATE.test(start)) err.start = COPY.post.start;
    if (!DATE.test(end)) err.end = COPY.post.end;
    else if (DATE.test(start) && end <= start) err.end = COPY.post.endBeforeStart;
    if (!consent) err.consent = COPY.post.consent;
    setErrors(err);
    if (Object.keys(err).length) {
      haptic();
      return;
    }
    const listing: Listing = {
      id: `mine-${Date.now()}`,
      title: title.trim(),
      address: address.trim(),
      neighborhood: hood,
      lat: AREAS[hood].lat,
      lng: AREAS[hood].lng,
      subletFee: 0,
      feeSplitPct: 0,
      rent: Number(rent),
      utilitiesIncluded,
      utilitiesEstimate: utilitiesIncluded ? 0 : Number(utilities),
      startDate: start,
      endDate: end,
      bedrooms,
      furnished,
      unitType,
      transferType: transfer,
      distanceMiles: milesFromUC(AREAS[hood].lat, AREAS[hood].lng),
      description: description.trim() || "No description yet.",
      amenities: [],
      landlordConsent: true,
      confirmedDaysAgo: 0,
      photos: ["/photos/living-3.jpg", "/photos/bedroom-2.jpg", "/photos/kitchen-5.jpg"],
      sublessor: { id: "me", name: "You", detail: "UC verified" },
    };
    addListing(listing);
    haptic("success");
    showToast(COPY.toast.posted);
    setTitle("");
    setAddress("");
    setRent("");
    setUtilities("");
    setStart("");
    setEnd("");
    setDescription("");
    setConsent(false);
    router.push(`/listing/${listing.id}`);
  };

  const input = (err?: string) => ({
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: err ? "#ef4444" : c.border,
    backgroundColor: c.card,
    paddingHorizontal: 16,
    fontSize: 16,
    color: c.ink,
  });

  return (
    <Frame>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
          <View>
            <H1>Post a listing</H1>
            <Muted>Clear details get faster replies. Photos aren&apos;t part of this demo.</Muted>
          </View>

          <Field label="Headline" error={errors.title}>
            <TextInput value={title} onChangeText={setTitle} placeholder="Sunny room near campus" placeholderTextColor={c.muted} style={input(errors.title)} />
          </Field>
          <Field label="Street address" error={errors.address}>
            <TextInput value={address} onChangeText={setAddress} placeholder="123 Example St" placeholderTextColor={c.muted} style={input(errors.address)} />
          </Field>

          <Field label="Neighborhood">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {Object.keys(AREAS).map((n) => (
                <Chip key={n} label={n} active={hood === n} onPress={() => setHood(n)} />
              ))}
            </View>
          </Field>

          <Field label="Rent per month ($)" error={errors.rent}>
            <TextInput value={rent} onChangeText={setRent} keyboardType="number-pad" placeholder="650" placeholderTextColor={c.muted} style={input(errors.rent)} />
          </Field>

          <Field label="Bedrooms in unit">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <Chip key={n} label={n === 0 ? "Studio" : String(n)} active={bedrooms === n} onPress={() => setBedrooms(n)} />
              ))}
            </View>
          </Field>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>Utilities included in rent</Text>
            <Switch value={utilitiesIncluded} onValueChange={setUtilitiesIncluded} trackColor={{ true: c.brand }} />
          </View>
          {!utilitiesIncluded && (
            <Field label="Estimated utilities per month ($)" error={errors.utilities}>
              <TextInput value={utilities} onChangeText={setUtilities} keyboardType="number-pad" placeholder="80" placeholderTextColor={c.muted} style={input(errors.utilities)} />
            </Field>
          )}

          <Field label="Quick fill for a co-op term">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TERMS.map((t) => (
                <Chip
                  key={t.id}
                  label={`${t.label}  ${t.hint}`}
                  active={start === t.from && end === t.to}
                  onPress={() => {
                    setStart(t.from);
                    setEnd(t.to);
                  }}
                />
              ))}
            </View>
          </Field>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="Start date" error={errors.start}>
                <TextInput value={start} onChangeText={setStart} placeholder="2027-01-04" placeholderTextColor={c.muted} autoCapitalize="none" keyboardType="numbers-and-punctuation" style={input(errors.start)} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="End date" error={errors.end}>
                <TextInput value={end} onChangeText={setEnd} placeholder="2027-04-30" placeholderTextColor={c.muted} autoCapitalize="none" keyboardType="numbers-and-punctuation" style={input(errors.end)} />
              </Field>
            </View>
          </View>
          <Muted style={{ marginTop: -10, fontSize: 12 }}>Dates look like 2027-01-04 (year-month-day).</Muted>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>Furnished</Text>
            <Switch value={furnished} onValueChange={setFurnished} trackColor={{ true: c.brand }} />
          </View>

          <Field label="What are you offering?">
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Chip label="A room" active={unitType === "room"} onPress={() => setUnitType("room")} style={{ flex: 1, alignItems: "center" }} />
              <Chip label="Whole unit" active={unitType === "whole"} onPress={() => setUnitType("whole")} style={{ flex: 1, alignItems: "center" }} />
            </View>
          </Field>

          <Field label="Lease transfer type">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(Object.keys(TRANSFER_SHORT) as TransferType[]).map((t) => (
                <Chip key={t} label={TRANSFER_SHORT[t]} active={transfer === t} onPress={() => setTransfer(t)} />
              ))}
            </View>
            <Muted style={{ fontSize: 12 }}>{TRANSFER_LABEL[transfer]}</Muted>
          </Field>

          <Field label="Description (optional)">
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Roommates, what's included, anything a subletter should know."
              placeholderTextColor={c.muted}
              style={[input(), { height: 110, paddingTop: 14, textAlignVertical: "top" }]}
            />
          </Field>

          <View style={{ gap: 6 }}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consent }}
              onPress={() => {
                haptic();
                setConsent(!consent);
              }}
              style={{ flexDirection: "row", gap: 12, alignItems: "center", borderWidth: 1, borderColor: errors.consent ? "#ef4444" : c.border, borderRadius: 18, padding: 16, backgroundColor: c.card }}
            >
              <Ionicons name={consent ? "checkbox" : "square-outline"} size={24} color={consent ? c.brand : c.muted} />
              <Text style={{ flex: 1, color: c.ink, fontSize: 15 }}>My lease allows subletting / I have landlord consent.</Text>
            </Pressable>
            {errors.consent ? <Text style={{ color: "#ef4444", fontSize: 13 }}>{errors.consent}</Text> : null}
          </View>

          <Button title="Post listing" size="lg" onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Frame>
  );
}
