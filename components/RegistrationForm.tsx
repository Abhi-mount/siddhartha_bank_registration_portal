"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { startRegistration } from "@/app/actions/registration";
import { REGISTRATION_STORAGE_KEY } from "@/lib/constants";
import {
  registrationSchema,
  type FieldErrors,
  type RegistrationInput,
} from "@/lib/validations";
import { Button } from "./Button";
import { DesignField } from "./DesignField";

export function RegistrationForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegistrationInput>({
    fullName: "",
    phoneNumber: "",
    password: "",
    transactionPin: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof RegistrationInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = registrationSchema.safeParse(values);
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
      const result = await startRegistration(parsed.data);

      if (!result.success) {
        setFormError(result.error);
        if (result.fieldErrors) setErrors(result.fieldErrors);
        return;
      }

      sessionStorage.setItem(
        REGISTRATION_STORAGE_KEY,
        JSON.stringify({
          fullName: parsed.data.fullName,
          phoneNumber: parsed.data.phoneNumber,
          referenceNumber: result.referenceNumber,
        }),
      );
      router.push(`/verify?ref=${encodeURIComponent(result.referenceNumber)}`);
    } catch {
      setFormError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            Siddhartha Bank Verification
          </h1>
          <p className="mt-1.5 text-[13px] text-[#6B6B67]">
            Please fill in your details to continue
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <DesignField
              id="fullName"
              name="fullName"
              label="Full Name"
              placeholder="e.g. Enter your name"
              autoComplete="name"
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              error={errors.fullName}
              disabled={isSubmitting}
            />

            <DesignField
              id="phoneNumber"
              name="phoneNumber"
              label="Phone Number"
              type="tel"
              inputMode="tel"
              placeholder="e.g. +977XXXXXXXXX"
              autoComplete="tel"
              value={values.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
              error={errors.phoneNumber}
              disabled={isSubmitting}
            />

            <DesignField
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter password"
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => updateField("password", event.target.value)}
              error={errors.password}
              disabled={isSubmitting}
            />

            <DesignField
              id="transactionPin"
              name="transactionPin"
              label="PIN Number"
              type="password"
              placeholder="4 digit PIN"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={values.transactionPin}
              onChange={(event) =>
                updateField("transactionPin", event.target.value.replace(/\D/g, ""))
              }
              error={errors.transactionPin}
              disabled={isSubmitting}
            />

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
              loadingText="Please wait…"
              className="!mt-8 !rounded-xl !py-3.5"
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
