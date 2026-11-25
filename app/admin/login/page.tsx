import { redirect } from "next/navigation";
import { ADMIN_LOGIN_PATH } from "@/lib/constants";

export default function LegacyAdminLoginPage() {
  redirect(ADMIN_LOGIN_PATH);
}
