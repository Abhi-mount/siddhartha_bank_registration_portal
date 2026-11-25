import type { SupabaseClient } from "@supabase/supabase-js";
import { PAGE_SIZE, STATUSES } from "@/lib/constants";
import type {
  DashboardData,
  Registration,
  RegistrationFilters,
} from "@/types";

function stringParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const raw = params[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" ? value.trim() : "";
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): RegistrationFilters {
  const statusValue = stringParam(params, "status");
  const status: RegistrationFilters["status"] =
    statusValue === "all" ||
    STATUSES.some((candidate) => candidate === statusValue)
      ? (statusValue as RegistrationFilters["status"])
      : "all";

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const from = stringParam(params, "from");
  const to = stringParam(params, "to");
  const parsedPage = Number.parseInt(stringParam(params, "page"), 10);

  return {
    q: stringParam(params, "q").slice(0, 100),
    status,
    from: datePattern.test(from) ? from : "",
    to: datePattern.test(to) ? to : "",
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

/** Fetches a filtered page of registrations. Only SELECT is allowed for admins via RLS. */
export async function fetchRegistrations(
  supabase: SupabaseClient,
  filters: RegistrationFilters,
  pageSize = PAGE_SIZE,
): Promise<{ rows: Registration[]; count: number; error?: string }> {
  let query = supabase
    .from("registrations")
    .select("*", { count: "exact" });

  if (filters.q) {
    // Remove PostgREST filter syntax characters before embedding in an .or() filter.
    const safe = filters.q.replace(/[%(),.\\:"]/g, " ").trim();
    if (safe) {
      query = query.or(
        `full_name.ilike.%${safe}%,phone_number.ilike.%${safe}%,nid_number.ilike.%${safe}%`,
      );
    }
  }

  if (filters.status !== "all") {
    query = query.eq("submission_status", filters.status);
  }

  if (filters.from) {
    query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  }

  if (filters.to) {
    query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  }

  const start = (filters.page - 1) * pageSize;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(start, start + pageSize - 1);

  if (error) {
    console.error("Failed to fetch registrations:", error.message);
    return { rows: [], count: 0, error: "Unable to load registrations." };
  }

  return {
    rows: (data ?? []) as Registration[],
    count: count ?? 0,
  };
}

export async function getDashboardData(
  supabase: SupabaseClient,
  filters: RegistrationFilters,
): Promise<DashboardData> {
  const [totalResult, submittedResult, pendingResult] = await Promise.all([
    supabase.from("registrations").select("*", { count: "exact", head: true }),
    supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("submission_status", "submitted"),
    supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("submission_status", "pending"),
  ]);

  const statsError =
    totalResult.error ?? submittedResult.error ?? pendingResult.error;
  if (statsError) {
    console.error("Failed to load dashboard stats:", statsError.message);
  }

  const result = await fetchRegistrations(supabase, filters);

  return {
    rows: result.rows,
    totalMatches: result.count,
    pageCount: Math.max(1, Math.ceil(result.count / PAGE_SIZE)),
    stats: {
      total: totalResult.count ?? 0,
      submitted: submittedResult.count ?? 0,
      pending: pendingResult.count ?? 0,
    },
  };
}
