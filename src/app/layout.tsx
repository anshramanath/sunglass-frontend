import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import Providers from "@/components/providers/Providers";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brandStyle = {
    "--color-brand": BRAND.accent,
    "--color-sale": BRAND.accent,
  } as CSSProperties;

  return (
    <html lang="en" className={`${hanken.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-paper text-ink" style={brandStyle}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
