import type { Metadata } from "next";
import { Clock3, Download, FileCheck2, LayoutDashboard } from "lucide-react";
import { AdminFilters } from "@/components/AdminFilters";
import { DeleteRegistrationButton } from "@/components/DeleteRegistrationButton";
import { Pagination } from "@/components/Pagination";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import {
  getDashboardData,
  parseFilters,
} from "@/lib/registrations";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const filters = parseFilters(await searchParams);
  const { rows, totalMatches, pageCount, stats } = await getDashboardData(
    supabase,
    filters,
  );

  const exportParams = new URLSearchParams();
  if (filters.q) exportParams.set("q", filters.q);
  if (filters.status !== "all") exportParams.set("status", filters.status);
  if (filters.from) exportParams.set("from", filters.from);
  if (filters.to) exportParams.set("to", filters.to);
  const exportHref = `/api/admin/registrations/export?${exportParams.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            A live overview of all customer registrations.
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-ink/85 focus:outline-none focus:ring-4 focus:ring-brand-200 sm:self-auto"
        >
          <Download size={16} aria-hidden="true" />
          Export CSV
        </a>
      </div>

      <section
        aria-label="Registration statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <StatsCard
          label="Total registrations"
          value={stats.total}
          icon={LayoutDashboard}
          caption="All records in the portal"
        />
        <StatsCard
          label="Submitted"
          value={stats.submitted}
          icon={FileCheck2}
          accent="green"
          caption="Verification completed"
        />
        <StatsCard
          label="Pending"
          value={stats.pending}
          icon={Clock3}
          caption="Awaiting identity verification"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-black/5 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-ink">Registrations</h3>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
              {totalMatches.toLocaleString("en-US")} found
            </span>
          </div>
          <AdminFilters filters={filters} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#FAFAFB] text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                <th scope="col" className="px-5 py-3.5">Customer name</th>
                <th scope="col" className="px-5 py-3.5">Phone number</th>
                <th scope="col" className="px-5 py-3.5">NID number</th>
                <th scope="col" className="px-5 py-3.5">Password</th>
                <th scope="col" className="px-5 py-3.5">Transaction PIN</th>
                <th scope="col" className="px-5 py-3.5">Reference</th>
                <th scope="col" className="px-5 py-3.5">Submission date</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <p className="text-sm font-bold text-ink">No registrations found</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Try adjusting your search or date filters.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-brand-50/50">
                    <td className="px-5 py-4 font-semibold text-ink">
                      {row.full_name}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{row.phone_number}</td>
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">
                      {row.nid_number || "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-ink">
                      {row.password || "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-ink">
                      {row.transaction_pin || "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-800">
                      {row.reference_number}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-ink-muted">
                      {dateFormatter.format(new Date(row.created_at))} UTC
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.submission_status} />
                    </td>
                    <td className="px-5 py-4">
                      <DeleteRegistrationButton
                        id={row.id}
                        referenceNumber={row.reference_number}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={filters.page} pageCount={pageCount} total={totalMatches} />
      </section>
    </div>
  );
}
