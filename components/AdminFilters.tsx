"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import type { RegistrationFilters } from "@/types";

export function AdminFilters({ filters }: { filters: RegistrationFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(filters.q);

  useEffect(() => {
    setQuery(filters.q);
  }, [filters.q]);

  function apply(patch: Partial<RegistrationFilters>) {
    const next: RegistrationFilters = { ...filters, ...patch, page: 1 };
    const params = new URLSearchParams();

    if (next.q) params.set("q", next.q);
    if (next.status !== "all") params.set("status", next.status);
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);

    const search = params.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply({ q: query.trim() });
  }

  const hasFilters =
    Boolean(filters.q) ||
    filters.status !== "all" ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
      <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          />
          <input
            id="filter-q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone or NID…"
            aria-label="Search by name, phone or NID"
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={filters.status}
          onChange={(event) =>
            apply({ status: event.target.value as RegistrationFilters["status"] })
          }
          aria-label="Filter by status"
          className={inputClass}
        >
          <option value="all">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(event) => apply({ from: event.target.value })}
          aria-label="From date"
          className={inputClass}
        />

        <input
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(event) => apply({ to: event.target.value })}
          aria-label="To date"
          className={inputClass}
        />

        <div className="flex gap-2">
          <button type="submit" className="btn-primary whitespace-nowrap px-5 py-2.5">
            Search
          </button>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                apply({ q: "", status: "all", from: "", to: "" });
              }}
              className="btn-ghost px-3 py-2.5"
              aria-label="Clear filters"
              title="Clear filters"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
