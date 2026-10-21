import type { Metadata, Viewport } from "next";
import { Gaegu, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import PencilDefs from "@/components/PencilDefs";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const hand = Gaegu({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-hand",
  display: "swap",
});

const ui = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://kira-serasi.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kira Serasi: Serasi ke tak?",
    template: "%s | Kira Serasi",
  },
  description:
    "Permainan kira serasi zaman sekolah dalam buku latihan. Tulis dua nama, kira huruf, tambah nombor, dapat peratus. Untuk suka-suka je!",
  applicationName: "Kira Serasi",
  keywords: [
    "kira serasi",
    "serasi app",
    "kalkulator serasi",
    "love calculator malaysia",
    "permainan zaman sekolah",
    "buku latihan",
    "compatibility test",
  ],
  authors: [{ name: "Hadi Hafiz", url: "https://github.com/hadihafiz" }],
  creator: "Hadi Hafiz",
  publisher: "Hadi Hafiz",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kira Serasi: Serasi ke tak?",
    description: "Permainan kira serasi zaman sekolah. Tulis dua nama, tengok berapa % serasi!",
    siteName: "Kira Serasi",
    url: siteUrl,
    type: "website",
    locale: "ms_MY",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Kira Serasi - Kalkulator Serasi Nostalgia",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kira Serasi: Serasi ke tak?",
    description: "Permainan kira serasi zaman sekolah. Tulis dua nama, tengok berapa % serasi!",
    images: ["/api/og"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kira Serasi",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#fffdf4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" className={`${hand.variable} ${ui.variable}`}>
      <body>
        <PencilDefs />
        <ServiceWorkerRegister />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
