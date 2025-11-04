import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerLocale } from "@/lib/server/locale";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bookhunt.local";

export const metadata: Metadata = {
  title: "Bookhunt",
  description: "Bookhunt frontend connected to Directus for managing book collections.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Bookhunt",
    description: "Manage your reading catalog with a Directus powered backend.",
    url: siteUrl,
    siteName: "Bookhunt",
    images: [
      {
        url: "/book.svg",
        width: 120,
        height: 120,
        alt: "Bookhunt logo",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getServerLocale();
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Providers locale={locale}>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
