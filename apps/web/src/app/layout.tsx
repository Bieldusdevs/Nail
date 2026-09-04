import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/ui/skip-link";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumeatelier.pt",
  ),
  title: {
    default: "Lume Atelier — Nail artistry em Almada",
    template: "%s — Lume Atelier",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "beauty",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    title: "Lume Atelier — Arte à flor da pele",
    description: siteConfig.description,
    images: [{ url: "/images/hero-nail-art.jpg", width: 1376, height: 768 }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fffef7",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NailSalon",
    name: siteConfig.name,
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua Cândido dos Reis 42",
      postalCode: "2800-270",
      addressLocality: "Almada",
      addressCountry: "PT",
    },
  };

  return (
    <html lang="pt-PT">
      <body>
        <SkipLink />
        <SmoothScroll />
        <SiteHeader />
        {children}
        <SiteFooter />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
