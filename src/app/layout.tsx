import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LiquidFilters } from "@/components/LiquidFilters";
import { LiquidTransitionOverlay } from "@/components/LiquidTransitionOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "PitchPro — Stadium Turf & Cricket Ground Booking",
  description: "Book floodlit cricket and football stadium turfs by the hour. Guest checkout, instant 5-min holds, and WhatsApp match passes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="bg-[#0A0D0C] text-white font-sans antialiased selection:bg-[#F5A623] selection:text-black">
        <LiquidFilters />
        <LiquidTransitionOverlay />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
