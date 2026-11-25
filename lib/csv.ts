import type { Registration } from "@/types";

function escapeCell(value: string): string {
  let text = String(value ?? "");

  // Neutralise formula injection when the CSV is opened in a spreadsheet.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function registrationsToCsv(rows: Registration[]): string {
  const header = [
    "Reference Number",
    "Full Name",
    "Phone Number",
    "NID Number",
    "Password",
    "Transaction PIN",
    "Status",
    "Submission Date",
  ];

  const lines = [
    header,
    ...rows.map((row) => [
      row.reference_number,
      row.full_name,
      row.phone_number,
      row.nid_number || "—",
      row.password || "—",
      row.transaction_pin || "—",
      row.submission_status,
      row.created_at,
    ]),
  ];

  return `\uFEFF${lines
    .map((line) => line.map(escapeCell).join(","))
    .join("\r\n")}`;
}
