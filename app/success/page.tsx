import type { Metadata } from "next";
import { SuccessModal } from "@/components/SuccessModal";

export const metadata: Metadata = {
  title: "Submission complete",
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const referenceNumber = ref?.trim() || "Reference unavailable";

  return <SuccessModal referenceNumber={referenceNumber} />;
}
