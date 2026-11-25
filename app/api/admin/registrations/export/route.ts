import { NextRequest } from "next/server";
import { registrationsToCsv } from "@/lib/csv";
import { getAdminContext } from "@/lib/auth";
import { fetchRegistrations, parseFilters } from "@/lib/registrations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const context = await getAdminContext();

  if (!context) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = { ...parseFilters(params), page: 1 };
  const { rows, error } = await fetchRegistrations(context.supabase, filters, 10000);

  if (error) {
    return new Response(error, { status: 502 });
  }

  return new Response(registrationsToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="registrations.csv"',
      "Cache-Control": "no-store",
    },
  });
}
