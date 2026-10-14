import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { bedroomLabel, feeShares, fmtMiles, fmtMoney, fmtMoney0, fmtRange, freshness, monthsBetween, TRANSFER_SHORT, UNIT_LABEL } from "@/lib/format";
import { matchFit } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import type { Listing } from "@/lib/types";
import { Photo } from "./Photo";
import { Button } from "./ui";

const total = (l: Listing) => l.rent + (l.utilitiesIncluded ? 0 : l.utilitiesEstimate);

interface Row {
  label: string;
  value: (l: Listing) => string;
  best?: (l: Listing) => number; // lower is better
}

const ROWS: Row[] = [
  { label: "Rent", value: (l) => `${fmtMoney(l.rent)}/mo`, best: (l) => l.rent },
  { label: "Utilities", value: (l) => (l.utilitiesIncluded ? "Included" : `~${fmtMoney(l.utilitiesEstimate)}/mo`) },
  { label: "Est. total", value: (l) => `${fmtMoney(total(l))}/mo`, best: total },
  { label: "Your sublet fee", value: (l) => (l.subletFee > 0 ? fmtMoney0(feeShares(l.subletFee, l.feeSplitPct).subletter) : "None"), best: (l) => feeShares(l.subletFee, l.feeSplitPct).subletter },
  { label: "Dates", value: (l) => fmtRange(l.startDate, l.endDate, true) },
  { label: "Length", value: (l) => `${monthsBetween(l.startDate, l.endDate)} months` },
  { label: "Area", value: (l) => l.neighborhood },
  { label: "From UC", value: (l) => fmtMiles(l.distanceMiles), best: (l) => l.distanceMiles },
  { label: "Unit", value: (l) => `${UNIT_LABEL[l.unitType]} · ${bedroomLabel(l.bedrooms)}` },
  { label: "Furnished", value: (l) => (l.furnished ? "Yes" : "No") },
  { label: "Lease transfer", value: (l) => TRANSFER_SHORT[l.transferType] },
  { label: "Availability", value: (l) => freshness(l.confirmedDaysAgo).label },
];

const COL = 168;
const LABEL_W = 104;

// Side-by-side comparison. The best value in a row turns green. Scrolls sideways on phones.
export function CompareTable({ listings }: { listings: Listing[] }) {
  const c = useColors();
  const { prefs } = useStore();
  const fitRow: Row[] = prefs ? [{ label: "Roommate fit", value: (l) => { const f = matchFit(prefs, l.household); return f ? `${f.score}% match` : "No roommates"; } }] : [];
  const rows = [...ROWS.slice(0, 5), ...fitRow, ...ROWS.slice(5)];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
      <View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: LABEL_W }} />
          {listings.map((l) => (
            <View key={l.id} style={{ width: COL, paddingRight: 12, gap: 8 }}>
              <View style={{ height: 110, borderRadius: 16, overflow: "hidden" }}>
                <Photo listing={l} style={{ flex: 1 }} />
              </View>
              <Text numberOfLines={2} style={{ color: c.ink, fontSize: 14, fontWeight: "500" }}>
                {l.title}
              </Text>
            </View>
          ))}
        </View>
        {rows.map((r) => {
          const scores = r.best ? listings.map(r.best) : [];
          const min = scores.length ? Math.min(...scores) : 0;
          const tie = scores.length > 0 && scores.every((s) => s === min);
          return (
            <View key={r.label} style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: c.border, paddingVertical: 12, marginTop: r.label === "Rent" ? 14 : 0 }}>
              <Text style={{ width: LABEL_W, color: c.muted, fontSize: 13 }}>{r.label}</Text>
              {listings.map((l, i) => {
                const win = r.best && !tie && scores[i] === min;
                return (
                  <Text key={l.id} style={{ width: COL, paddingRight: 12, fontSize: 14, color: win ? c.good : c.ink, fontWeight: win ? "700" : "400" }}>
                    {r.value(l)}
                    {win ? "  ✓" : ""}
                  </Text>
                );
              })}
            </View>
          );
        })}
        <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12 }}>
          <View style={{ width: LABEL_W }} />
          {listings.map((l) => (
            <View key={l.id} style={{ width: COL, paddingRight: 12 }}>
              <Button title="View" size="sm" variant="outline" onPress={() => router.push(`/listing/${l.id}`)} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
