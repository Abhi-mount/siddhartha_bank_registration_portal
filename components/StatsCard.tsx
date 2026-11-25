import type { LucideIcon } from "lucide-react";

export function StatsCard({
  label,
  value,
  icon: Icon,
  accent = "yellow",
  caption,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: "yellow" | "green" | "slate";
  caption: string;
}) {
  const accents = {
    yellow: "bg-brand-100 text-brand-700",
    green: "bg-emerald-100 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
  } as const;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">
            {label}
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink tabular-nums">
            {value.toLocaleString("en-US")}
          </p>
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}
        >
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs text-ink-muted">{caption}</p>
    </div>
  );
}
