import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Name must be 100 characters or fewer.")
    .regex(
      /^[\p{L}][\p{L}\s'.-]*$/u,
      "Use letters, spaces, hyphens and apostrophes only.",
    ),
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(20, "Phone number must be 20 characters or fewer.")
    .regex(/^\+?[0-9\s()-]+$/, "Use digits, spaces, +, - and brackets only.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    }, "Phone number must contain 7 to 15 digits."),
  // No restrictions: any characters and any length are accepted.
  password: z.string(),
  transactionPin: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/, "Transaction PIN must be 4 to 6 digits."),
});

export const verificationSchema = z.object({
  referenceNumber: z
    .string()
    .trim()
    .regex(/^BR-\d{8}-[A-Z0-9]{6}$/, "Invalid registration reference."),
  nidNumber: z
    .string()
    .trim()
    .regex(/^\d{8,20}$/, "NID number must contain 8 to 20 digits."),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;

export type FieldErrors = Record<string, string | undefined>;

export function firstFieldErrors(
  fieldErrors: z.ZodIssue[],
): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of fieldErrors) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}
