import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generates a human-friendly, hard-to-guess registration reference: BR-YYYYMMDD-XXXXXX */
export function generateReferenceNumber(now = new Date()): string {
  const date = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");

  const suffix = Array.from(randomBytes(6))
    .map((byte) => ALPHABET[byte % ALPHABET.length])
    .join("");

  return `BR-${date}-${suffix}`;
}
