import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toast } from "@/components/Toast";
import { StoreProvider, useStore } from "@/lib/store";
import { DARK, LIGHT } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

// Sends people to sign-in, then to the welcome slides, before they see the app.
function Gate() {
  const { ready, user, onboarded } = useStore();
  const segments = useSegments();
  const router = useRouter();
  const first = segments[0] as string | undefined;

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync();
    if (!user) {
      if (first !== "signin") router.replace("/signin");
    } else if (!onboarded) {
      if (first !== "welcome") router.replace("/welcome");
    } else if (first === "signin" || first === "welcome") {
      router.replace("/");
    }
  }, [ready, user, onboarded, first, router]);

  return null;
}

export default function RootLayout() {
  const dark = useColorScheme() === "dark";
  const base = dark ? DarkTheme : DefaultTheme;
  const p = dark ? DARK : LIGHT;
  const theme = { ...base, colors: { ...base.colors, background: p.bg, card: p.card, text: p.ink, border: p.border, primary: p.brand } };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <ThemeProvider value={theme}>
            <StatusBar style={dark ? "light" : "dark"} />
            <Gate />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.bg } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="signin" options={{ animation: "fade" }} />
              <Stack.Screen name="welcome" options={{ animation: "fade", gestureEnabled: false }} />
              <Stack.Screen name="listing/[id]" />
              <Stack.Screen name="chat/[id]" />
              <Stack.Screen name="account" options={{ presentation: "modal" }} />
            </Stack>
            <Toast />
          </ThemeProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
