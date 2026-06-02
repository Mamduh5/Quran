import type { Metadata } from "next";

import "@/app/globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Quran Reader",
  description:
    "A reliable Quran reader foundation with verified sources, checksums, translations, and tafsir support."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
