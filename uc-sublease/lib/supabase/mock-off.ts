// Stand-in for mock.ts in normal builds, so the fake backend and its sample data never reach production bundles.
// next.config.ts points the "mock-backend" alias here unless NEXT_PUBLIC_MOCK_BACKEND=1.
import type { Supabase } from "./client";

export function createMockSupabase(): Supabase {
  throw new Error("The mock backend is off. Start the app with NEXT_PUBLIC_MOCK_BACKEND=1 to use it.");
}
