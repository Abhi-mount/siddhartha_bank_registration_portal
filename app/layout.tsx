import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Siddhartha Bank Registration Portal",
    template: "%s | Siddhartha Bank",
  },
  description:
    "A secure, simple two-step customer registration portal with an admin dashboard.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
