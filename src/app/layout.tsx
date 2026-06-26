import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { getBrand } from "@/lib/brand";
import Providers from "@/components/providers/Providers";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return { title: brand.name, description: brand.description };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand();
  const brandStyle = {
    "--color-brand": brand.accent,
  } as CSSProperties;

  return (
    <html lang="en" className={`${hanken.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-paper text-ink" style={brandStyle}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
