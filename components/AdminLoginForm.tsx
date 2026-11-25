"use client";

import { useActionState } from "react";
import { LockKeyhole, Mail, ShieldAlert } from "lucide-react";
import { signInAdmin, type LoginState } from "@/app/actions/auth";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { TextField } from "./TextField";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    signInAdmin,
    {},
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111318] px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo inverse compact />
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
          <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <LockKeyhole size={22} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Restricted area. Use your authorized bank administrator account.
          </p>

          <form action={formAction} className="mt-8 space-y-5">
            <div className="relative">
              <Mail
                size={17}
                className="pointer-events-none absolute left-4 top-[42px] text-ink-soft"
                aria-hidden="true"
              />
              <TextField
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="admin@yourbank.com"
                autoComplete="username"
                className="pl-11"
                disabled={pending}
                required
              />
            </div>

            <div className="relative">
              <LockKeyhole
                size={17}
                className="pointer-events-none absolute left-4 top-[42px] text-ink-soft"
                aria-hidden="true"
              />
              <TextField
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••••"
                autoComplete="current-password"
                className="pl-11"
                disabled={pending}
                required
              />
            </div>

            {state.error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
              >
                <ShieldAlert size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                {state.error}
              </p>
            ) : null}

            <Button type="submit" loading={pending} loadingText="Signing in…">
              Sign in securely
            </Button>
          </form>

          <p className="mt-7 border-t border-ink/5 pt-6 text-center text-xs text-ink-muted">
            Public administrator registration is disabled.
          </p>
        </div>
      </div>
    </main>
  );
}
