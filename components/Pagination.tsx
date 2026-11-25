"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE } from "@/lib/constants";

export function Pagination({
  page,
  pageCount,
  total,
}: {
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  function goTo(nextPage: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-black/5 px-5 py-4 sm:flex-row">
      <p className="text-xs text-ink-muted">
        Showing <span className="font-bold text-ink">{start}</span>–
        <span className="font-bold text-ink">{end}</span> of{" "}
        <span className="font-bold text-ink">{total}</span> registrations
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="btn-ghost px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden="true" /> Previous
        </button>
        <span className="min-w-[70px] text-center text-xs font-bold text-ink">
          Page {page} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= pageCount}
          className="btn-ghost px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
