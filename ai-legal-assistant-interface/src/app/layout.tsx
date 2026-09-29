import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Legal Assistant using RAG — Legal Intelligence Platform",
  description:
    "Evidence-aware legal question answering, claim verification, document analysis and legal research, grounded in a PostgreSQL retrieval corpus.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
