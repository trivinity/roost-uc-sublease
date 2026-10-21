import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListingRow } from "@/components/ListingRow";
import { Button, EmptyState, H1, Muted } from "@/components/ui";
import { COPY } from "@/lib/copy";
import { freshness } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

// Account and My listings. Re-confirming a listing resets the "last confirmed" label students see.
export default function Account() {
  const c = useColors();
  const { user, listings, confirmListing, removeListing, signOut } = useStore();
  const mine = listings.filter((l) => l.sublessor.id === "me");

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: c.brand, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>{user?.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: c.ink }}>{user?.name}</Text>
            <Muted>{user?.email}</Muted>
          </View>
        </View>

        <Button
          title="Roommate preferences"
          icon="options-outline"
          variant="outline"
          onPress={() => {
            router.dismiss();
            router.push("/preferences");
          }}
        />

        <H1 style={{ fontSize: 22 }}>My listings</H1>
        <Muted style={{ marginTop: -10 }}>Keep them fresh so students know they&apos;re still available.</Muted>

        {mine.length === 0 ? (
          <EmptyState
            title={COPY.empty.mine.title}
            body={COPY.empty.mine.body}
            action={
              <Button
                title="Post a listing"
                onPress={() => {
                  router.dismiss();
                  router.navigate("/post");
                }}
              />
            }
          />
        ) : (
          mine.map((l) => (
            <View key={l.id} style={{ gap: 10 }}>
              <ListingRow listing={l} mine />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title={freshness(l.confirmedDaysAgo).tone === "good" ? "Confirmed today" : "Still available"} icon="checkmark-circle-outline" size="sm" variant="outline" disabled={l.confirmedDaysAgo === 0} onPress={() => confirmListing(l.id)} />
                <Button title="Mark as rented" icon="trash-outline" size="sm" variant="ghost" onPress={() => removeListing(l.id)} />
              </View>
            </View>
          ))
        )}

        <Button
          title="Sign out"
          variant="outline"
          size="lg"
          style={{ marginTop: 12 }}
          onPress={() => {
            router.dismiss();
            signOut();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
