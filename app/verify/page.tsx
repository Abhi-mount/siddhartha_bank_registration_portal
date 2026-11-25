import type { Metadata } from "next";
import { VerificationForm } from "@/components/VerificationForm";

export const metadata: Metadata = {
  title: "Verify identity",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <VerificationForm referenceNumber={ref ?? ""} />;
}
