import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { photoSource } from "@/lib/photos";
import { useColors } from "@/lib/theme";
import type { Listing } from "@/lib/types";

// Listing photo that fills its box and fades in.
export function Photo({ listing, index = 0, style }: { listing: Listing; index?: number; style?: ComponentProps<typeof Image>["style"] }) {
  const c = useColors();
  return (
    <Image
      source={photoSource(listing.photos[index] ?? listing.photos[0])}
      style={[{ backgroundColor: c.soft }, style]}
      contentFit="cover"
      transition={250}
      accessibilityLabel={`${listing.title}, photo ${index + 1}`}
    />
  );
}
