import type { SupabaseClient } from "@supabase/supabase-js";

/** Checks the database allowlist via the SECURITY DEFINER RPC exposed by the schema migration. */
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("Admin authorization check failed:", error.message);
    return false;
  }

  return data === true;
}
