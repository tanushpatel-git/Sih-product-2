import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUS — Hospital Forecasting & Resource Intelligence System",
  description: "Mission-control healthcare intelligence: 7-day ML patient demand forecasting, capacity breach mitigation, and regional load-shedding coordination.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080909] text-[#F3F4F6] font-sans selection:bg-[#D3FD50] selection:text-[#080909]">
        {children}
      </body>
    </html>
  );
}
