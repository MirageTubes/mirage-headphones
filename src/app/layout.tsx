import type { Metadata, Viewport } from "next";
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

// Absolute base for share images: your Vercel production URL when deployed.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mirage — Headphone Concept",
    template: "%s · Mirage",
  },
  description:
    "The city hums in one key. You walk in yours. An interactive, scroll-driven headphone concept by Mirage — an independent design study.",
  applicationName: "Mirage",
  openGraph: {
    type: "website",
    siteName: "Mirage",
    title: "Mirage — Headphone Concept",
    description:
      "The city hums in one key. You walk in yours. An interactive headphone concept.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirage — Headphone Concept",
    description:
      "The city hums in one key. You walk in yours. An interactive headphone concept.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
