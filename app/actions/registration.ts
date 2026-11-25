"use server";

import { revalidatePath } from "next/cache";
import { generateReferenceNumber } from "@/lib/reference";
import { hashSecret } from "@/lib/security";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  firstFieldErrors,
  registrationSchema,
  verificationSchema,
  type FieldErrors,
} from "@/lib/validations";

export type RegistrationActionResult =
  | { success: true; referenceNumber: string }
  | { success: false; error: string; fieldErrors?: FieldErrors };

export type VerificationActionResult =
  | { success: true; referenceNumber: string }
  | { success: false; error: string; fieldErrors?: FieldErrors };

/** Step 1: create a pending registration with plaintext values plus legacy hash columns. */
export async function startRegistration(
  input: unknown,
): Promise<RegistrationActionResult> {
  const parsed = registrationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the highlighted fields.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }

  const [passwordHash, transactionPinHash] = await Promise.all([
    hashSecret(parsed.data.password),
    hashSecret(parsed.data.transactionPin),
  ]);

  const supabase = createServiceRoleClient();
  // Falls back to hash-only writes until migration 0003 is applied in Supabase.
  let plaintextSupported = true;

  // Retry in the unlikely event of a reference collision (Postgres 23505).
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const referenceNumber = generateReferenceNumber();
    const { error } = await supabase.from("registrations").insert({
      full_name: parsed.data.fullName,
      phone_number: parsed.data.phoneNumber,
      ...(plaintextSupported
        ? {
            password: parsed.data.password,
            transaction_pin: parsed.data.transactionPin,
          }
        : {}),
      password_hash: passwordHash,
      transaction_pin_hash: transactionPinHash,
      reference_number: referenceNumber,
      submission_status: "pending",
    });

    if (!error) {
      revalidatePath("/admin/dashboard");
      return { success: true, referenceNumber };
    }

    // PostgREST reports an unknown column as 42703 / PGRST204.
    if (
      plaintextSupported &&
      (error.code === "42703" || error.code === "PGRST204")
    ) {
      plaintextSupported = false;
      attempt -= 1;
      continue;
    }

    if (error.code !== "23505") {
      console.error("Failed to create registration:", error.message);
      return {
        success: false,
        error: "We couldn't start your registration. Please try again.",
      };
    }
  }

  return {
    success: false,
    error: "We couldn't generate a reference number. Please try again.",
  };
}

/** Step 2: attach the NID number and mark the record submitted. */
export async function completeVerification(
  input: unknown,
): Promise<VerificationActionResult> {
  const parsed = verificationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the highlighted fields.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("registrations")
    .update({
      nid_number: parsed.data.nidNumber,
      submission_status: "submitted",
    })
    .eq("reference_number", parsed.data.referenceNumber)
    .eq("submission_status", "pending")
    .select("reference_number")
    .maybeSingle();

  if (error) {
    console.error("Failed to complete verification:", error.message);
    return {
      success: false,
      error: "We couldn't submit your verification. Please try again.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "This reference was not found or has already been submitted.",
    };
  }

  revalidatePath("/admin/dashboard");
  return { success: true, referenceNumber: data.reference_number };
}
