import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEIR",
  description: "Mongolian Men's Fashion — Монгол эрэгтэй загвар",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
