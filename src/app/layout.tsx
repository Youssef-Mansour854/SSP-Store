import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-arabic",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SSP STORE | سماعة JBL TUNE 730BT اللاسلكية الأسطورية",
  description:
    "متجر SSP Store - تجربة استماع نقية لا تُضاهى مع سماعة JBL Tune 730BT وعزل ضوضاء فائق وبطارية تدوم حتى 76 ساعة.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexArabic.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        {/* GSAP, ScrollTrigger, and Lenis from CDN without npm as requested */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#000000] text-[#f5f5f7] overflow-x-hidden selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
