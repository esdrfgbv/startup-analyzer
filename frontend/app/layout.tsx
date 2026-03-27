import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StratosAI — The Startup War Room",
  description: "Multi-agent AI startup intelligence system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
