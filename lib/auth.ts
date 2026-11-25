import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { ADMIN_LOGIN_PATH } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

/** Returns the verified admin session, or null. Use in Route Handlers. */
export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !(await isAdmin(supabase))) {
    return null;
  }

  return { supabase, user };
}

/** Redirects unauthenticated / non-allowlisted visitors to the admin login. */
export async function requireAdmin() {
  const context = await getAdminContext();

  if (!context) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return context;
}
