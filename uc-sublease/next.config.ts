import type { NextConfig } from "next";

// Student photos are served from Supabase Storage.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

// The fake backend for local UI testing is only compiled in when NEXT_PUBLIC_MOCK_BACKEND=1; otherwise it is swapped for a stub.
const mock = process.env.NEXT_PUBLIC_MOCK_BACKEND === "1";

const nextConfig: NextConfig = {
  devIndicators: false, // the floating dev badge sits on top of the bottom tab bar on phones
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
  turbopack: {
    resolveAlias: { "mock-backend": mock ? "./lib/supabase/mock.ts" : "./lib/supabase/mock-off.ts" },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
