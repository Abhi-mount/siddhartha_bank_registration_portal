import { createBrowserClient } from "@supabase/ssr";

/** Browser client for optional client-side Supabase usage. It only ever receives the public anon key. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
