"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type DeleteRegistrationResult =
  | { success: true }
  | { success: false; error: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Permanently deletes a registration. The caller must be a verified,
 * allowlisted admin; the service role is only used after that check because
 * client-side deletes are revoked by RLS.
 */
export async function deleteRegistration(
  id: string,
): Promise<DeleteRegistrationResult> {
  await requireAdmin();

  if (!UUID_PATTERN.test(id)) {
    return { success: false, error: "Invalid registration record." };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("registrations").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete registration:", error.message);
    return { success: false, error: "Unable to delete this record. Please try again." };
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}
