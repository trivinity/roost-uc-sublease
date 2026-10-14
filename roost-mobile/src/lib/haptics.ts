import * as Haptics from "expo-haptics";

// A tiny tap of feedback. Does nothing on platforms without haptics (like web).
export function haptic(kind: "light" | "success" = "light") {
  if (kind === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
