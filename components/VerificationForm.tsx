"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { completeVerification } from "@/app/actions/registration";
import { REGISTRATION_STORAGE_KEY } from "@/lib/constants";
import { verificationSchema, type FieldErrors } from "@/lib/validations";
import { Button } from "./Button";
import { DesignField } from "./DesignField";

type StoredRegistration = {
  referenceNumber: string;
};

export function VerificationForm({ referenceNumber }: { referenceNumber: string }) {
  const [storedReference, setStoredReference] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [nidNumber, setNidNumber] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(REGISTRATION_STORAGE_KEY);
      const parsed: StoredRegistration | null = raw ? JSON.parse(raw) : null;

      if (
        parsed?.referenceNumber &&
        (!referenceNumber || parsed.referenceNumber === referenceNumber)
      ) {
        setStoredReference(parsed.referenceNumber);
      }
    } catch {
      // Corrupt session data is treated as a missing registration.
    } finally {
      setIsReady(true);
    }
  }, [referenceNumber]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const ref = storedReference ?? referenceNumber;
    const parsed = verificationSchema.safeParse({
      referenceNumber: ref,
      nidNumber,
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await completeVerification(parsed.data);

      if (!result.success) {
        setFormError(result.error);
        if (result.fieldErrors) setErrors(result.fieldErrors);
        return;
      }

      sessionStorage.removeItem(REGISTRATION_STORAGE_KEY);
      setNidNumber("");
      setShowSuccess(true);
    } catch {
      setFormError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#D8D9D5]">
        <p className="text-sm font-semibold text-ink-muted">Loading…</p>
      </main>
    );
  }

  const ref = storedReference ?? referenceNumber;
  if (!verificationSchema.shape.referenceNumber.safeParse(ref).success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#D8D9D5] px-4">
        <div className="w-full max-w-[430px] overflow-hidden rounded-[28px] bg-[#F2F2F0] text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]">
          <div className="flex h-[190px] items-center justify-center bg-brand-500">
            <Image
              src="/logo.jpeg"
              alt="Siddhartha Bank"
              width={180}
              height={78}
              priority
              className="h-auto w-[180px] object-contain"
            />
          </div>
          <div className="px-7 pb-9 pt-8">
            <Link href="/" className="btn-primary">
              Start registration
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#D8D9D5] px-4 py-8">
      <div className="w-full max-w-[430px] overflow-hidden rounded-[28px] bg-[#F2F2F0] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex h-[190px] items-center justify-center bg-brand-500">
          <Image
            src="/logo.jpeg"
            alt="Siddhartha Bank"
            width={180}
            height={78}
            priority
            className="h-auto w-[180px] object-contain"
          />
        </div>

        <div className="px-7 pb-9 pt-8">
          <h1 className="text-[26px] font-bold leading-tight text-[#1B1B19]">
            NID VERIFICATION
          </h1>
          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <DesignField
              id="nidNumber"
              name="nidNumber"
              label="NID Number"
              type="text"
              inputMode="numeric"
              placeholder="enter your NID number"
              maxLength={20}
              value={nidNumber}
              onChange={(event) => {
                setNidNumber(event.target.value.replace(/\D/g, ""));
                setErrors((current) => ({ ...current, nidNumber: undefined }));
                setFormError(null);
              }}
              error={errors.nidNumber}
              disabled={isSubmitting}
            />

            {errors.referenceNumber ? (
              <p role="alert" className="text-xs font-medium text-red-600">
                {errors.referenceNumber}
              </p>
            ) : null}

            {formError ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Submitting…"
              className="!mt-10 !rounded-xl !py-3.5"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>

      {showSuccess ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
            className="animate-modal-in w-full max-w-[340px] rounded-[26px] bg-white px-6 pb-9 pt-9 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-500">
              <Check
                size={28}
                strokeWidth={3}
                className="text-[#1B1B19]"
                aria-hidden="true"
              />
            </div>
            <h2
              id="success-title"
              className="mt-5 text-[20px] font-bold leading-tight text-[#1B1B19]"
            >
              Submitted Successfully
            </h2>
            <p className="mt-3 text-[12px] text-[#6B6B67]">
              Your details have been received.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="mt-8 h-9 w-16 rounded-lg bg-brand-500 text-[13px] font-bold text-ink transition hover:bg-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-200"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
