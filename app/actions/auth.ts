"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_LOGIN_PATH } from "@/lib/constants";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signInAdmin(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { error: "Enter a valid email address and password." };
  }

  // Check the allowlist before authenticating so unknown accounts cannot sign in.
  const adminClient = createServiceRoleClient();
  const { data: allowedAccount } = await adminClient
    .from("admin_allowlist")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (!allowedAccount) {
    return { error: "This account is not authorized to access the admin console." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath(ADMIN_LOGIN_PATH);
  redirect(ADMIN_LOGIN_PATH);
}
