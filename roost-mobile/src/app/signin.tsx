/* eslint-disable react-hooks/immutability -- Reanimated shared values are meant to be assigned to (`x.value = ...`) */
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Button, Muted } from "@/components/ui";
import { DEMO_CODE, UC_EMAIL_PATTERN } from "@/lib/config";
import { COPY } from "@/lib/copy";
import { haptic } from "@/lib/haptics";
import { photoSource } from "@/lib/photos";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";

type Status = "idle" | "error" | "success";

export default function SignIn() {
  const c = useColors();
  const { signIn } = useStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const codeInput = useRef<TextInput>(null);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const submitEmail = () => {
    if (!UC_EMAIL_PATTERN.test(email.trim())) {
      setError(COPY.signin.notUc);
      haptic();
      return;
    }
    setError("");
    setStep("code");
    setTimeout(() => codeInput.current?.focus(), 100);
  };

  const onCode = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setStatus("idle");
    if (digits.length === 6) {
      if (digits === DEMO_CODE) {
        setStatus("success");
        haptic("success");
        setTimeout(() => signIn(email.trim()), 600);
      } else {
        setStatus("error");
        shake.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 90 }), withTiming(-8, { duration: 80 }), withTiming(0, { duration: 60 }));
        setTimeout(() => setCode(""), 500);
      }
    }
  };

  const boxColor = status === "error" ? "#ef4444" : status === "success" ? "#10b981" : c.border;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}>
        <View style={{ alignItems: "center", gap: 18, marginBottom: 32 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", height: 130 }}>
            {(["/photos/living-2.jpg", "/photos/bedroom-1.jpg", "/photos/kitchen-4.jpg"] as const).map((p, i) => (
              <Image
                key={p}
                source={photoSource(p)}
                style={{ width: 78, height: i === 1 ? 118 : 96, borderRadius: 16, transform: [{ rotate: `${(i - 1) * 6}deg` }] }}
                contentFit="cover"
              />
            ))}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: c.brand }} />
            <Text style={{ fontSize: 34, fontWeight: "700", letterSpacing: -1, color: c.ink }}>Roost</Text>
          </View>
          <Muted style={{ fontSize: 16 }}>Verified student subleases near UC.</Muted>
        </View>

        {step === "email" ? (
          <View style={{ gap: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>UC email</Text>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError("");
              }}
              placeholder="bearcat@mail.uc.edu"
              placeholderTextColor={c.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="go"
              onSubmitEditing={submitEmail}
              accessibilityLabel="UC email"
              style={{ height: 52, borderRadius: 16, borderWidth: 1, borderColor: error ? "#ef4444" : c.border, backgroundColor: c.card, paddingHorizontal: 16, fontSize: 16, color: c.ink }}
            />
            {error ? <Text style={{ color: "#ef4444", fontSize: 14 }}>{error}</Text> : null}
            <Button title="Send code" size="lg" onPress={submitEmail} />
          </View>
        ) : (
          <View style={{ gap: 18, alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>Enter your 6-digit code</Text>
            <Muted style={{ textAlign: "center" }}>
              We “sent” it to {email.trim()}. Demo code: <Text style={{ fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>{DEMO_CODE}</Text>
            </Muted>
            <Pressable onPress={() => codeInput.current?.focus()} accessibilityLabel="Code entry">
              <Animated.View style={[{ flexDirection: "row", gap: 8 }, shakeStyle]}>
                {Array.from({ length: 6 }, (_, i) => (
                  <View key={i} style={{ width: 46, height: 56, borderRadius: 14, borderWidth: 2, borderColor: i === code.length && status === "idle" ? c.brand : boxColor, backgroundColor: c.card, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 24, fontWeight: "600", color: c.ink }}>{code[i] ?? ""}</Text>
                  </View>
                ))}
              </Animated.View>
            </Pressable>
            <TextInput
              ref={codeInput}
              value={code}
              onChangeText={onCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              autoFocus
              style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
              accessibilityLabel="6-digit code"
            />
            <Text style={{ height: 20, color: "#ef4444", fontSize: 14 }}>{status === "error" ? COPY.signin.wrongCode : ""}</Text>
            <Pressable
              onPress={() => {
                setStep("email");
                setCode("");
                setStatus("idle");
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="arrow-back" size={16} color={c.muted} />
              <Text style={{ color: c.muted, fontSize: 14 }}>Use a different email</Text>
            </Pressable>
          </View>
        )}

        <View style={{ marginTop: 28, gap: 6, alignItems: "center" }}>
          <Muted style={{ fontSize: 12, textAlign: "center" }}>Prototype only. No real accounts or emails are used.</Muted>
          <Muted style={{ fontSize: 12, textAlign: "center" }}>Demo with fake data · Photos from Unsplash · Interface details from Rare UI</Muted>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
