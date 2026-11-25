"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, PartyPopper } from "lucide-react";

export function SuccessModal({
  referenceNumber,
  customerName,
}: {
  referenceNumber: string;
  customerName?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(referenceNumber);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-100 via-white to-brand-50 px-5 py-12">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        className="animate-modal-in w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-card"
      >
        <div className="relative bg-brand-500 px-8 pb-14 pt-10 text-center">
          <div className="absolute -bottom-9 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-2xl bg-white p-2 shadow-soft">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Check size={30} strokeWidth={3} aria-hidden="true" />
            </span>
          </div>
          <PartyPopper
            size={22}
            className="mx-auto mb-3 text-brand-900/70"
            aria-hidden="true"
          />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-900/70">
            All done
          </p>
        </div>

        <div className="px-8 pb-9 pt-14 text-center">
          <h1 id="success-title" className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Submitted Successfully!
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
            {customerName
              ? `Thank you, ${customerName}. Your registration has been received.`
              : "Your registration has been received. Keep your reference number for your records."}
          </p>

          <div className="mt-7 rounded-2xl border border-dashed border-brand-400 bg-brand-50 px-5 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-800">
              Your reference number
            </p>
            <p className="mt-2 break-all font-mono text-lg font-extrabold tracking-tight text-ink sm:text-xl">
              {referenceNumber}
            </p>
            <button
              type="button"
              onClick={copyReference}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 transition hover:text-brand-900"
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? "Copied!" : "Copy reference"}
            </button>
          </div>

          <Link href="/" className="btn-primary mt-8">
            <ArrowLeft size={18} aria-hidden="true" /> Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
