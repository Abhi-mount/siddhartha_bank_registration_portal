import { LayoutDashboard, LogOut, ShieldCheck, UsersRound } from "lucide-react";
import { signOutAdmin } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#17191E] px-5 py-6 lg:flex">
        <div className="flex justify-center">
          <Logo compact />
        </div>

        <div className="mt-10 space-y-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            Management
          </p>
          <div className="flex items-center gap-3 rounded-xl bg-brand-500 px-3 py-3 text-sm font-bold text-ink">
            <LayoutDashboard size={18} aria-hidden="true" />
            Overview
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/60">
            <UsersRound size={18} aria-hidden="true" />
            Registrations
          </div>
        </div>

        <div className="mt-auto rounded-2xl bg-white/5 p-4">
          <ShieldCheck size={20} className="text-brand-400" aria-hidden="true" />
          <p className="mt-3 text-xs font-bold text-white">Protected console</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/50">
            Sessions are validated on the server against the admin allowlist.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-black/5 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="lg:hidden">
              <Logo compact />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-extrabold tracking-tight text-ink">
                Registration overview
              </h1>
              <p className="text-xs text-ink-muted">
                Monitor and export customer submissions.
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-ink">{user.email}</p>
                <p className="text-[11px] text-ink-muted">Administrator</p>
              </div>
              <form action={signOutAdmin}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-xs font-bold text-ink transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:text-sm"
                >
                  <LogOut size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
