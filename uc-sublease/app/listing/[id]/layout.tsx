import type { Metadata } from "next";

export const metadata: Metadata = { title: "Listing" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
