import type { Metadata, Viewport } from "next";
import { Gaegu, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import PencilDefs from "@/components/PencilDefs";
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
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kira Serasi: Serasi ke tak?",
  description:
    "Permainan kira serasi zaman sekolah. Tulis dua nama, kira huruf, tambah nombor, dapat peratus. Untuk suka-suka je!",
  applicationName: "Kira Serasi",
  openGraph: {
    title: "Kira Serasi: Serasi ke tak?",
    description: "Permainan kira serasi zaman sekolah. Cuba nama korang!",
    siteName: "Kira Serasi",
    type: "website",
    locale: "ms_MY",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fffdf4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" className={`${hand.variable} ${ui.variable}`}>
      <body>
        <PencilDefs />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
