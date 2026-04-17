import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hongsu Portfolio",
  description: "Technical Artist portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
