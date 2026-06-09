import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lirae | Interactive Romance",
  description: "Choose your story. Fall in love.",
  keywords: ["interactive fiction", "romance", "choose your own adventure", "reading"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-near-black text-cream antialiased">
        {children}
        {/* Vercel Web Analytics — page-view/navigation only (no custom events,
            no story content, no reader free-text). Privacy-safe for 18+ content. */}
        <Analytics />
      </body>
    </html>
  );
}
