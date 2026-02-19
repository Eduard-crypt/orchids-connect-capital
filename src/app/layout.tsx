import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { PageLoadAnimation } from "@/components/page-load-animation";
import { CookieConsent } from "@/components/cookie-consent";
import NavigationHeader from "@/components/sections/navigation-header";
import { CartProvider } from "@/contexts/CartContext";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Connect Capitals - Buy, Sell & Grow Online Businesses | #1 in EU",
  description: "Connect Capitals is Europe's leading marketplace for online businesses. One of Europe's Fastest-Advancing Digital Industries. AI Agents Marketplace Designed to Expand Your Business Capabilities. 6 Years Trusted Expertise in Business Structure Analysis.",
  keywords: "buy online business, sell online business, ecommerce for sale, saas for sale, content site for sale, digital agency for sale, YouTube channel for sale, mobile app for sale, business marketplace, AI agents, Connect Capitals",
  authors: [{ name: "Connect Capitals" }],
  openGraph: {
    title: "Connect Capitals - Buy, Sell & Grow Online Businesses",
    description: "One of Europe's Fastest-Advancing Digital Industries. AI Agents Marketplace Designed to Expand Your Business Capabilities. 6 Years Trusted Expertise in Business Structure Analysis.",
    type: "website",
    locale: "en_US",
    siteName: "Connect Capitals",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connect Capitals - Buy, Sell & Grow Online Businesses",
    description: "One of Europe's Fastest-Advancing Digital Industries. AI Agents Marketplace with trusted business expertise.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="b0c6a439-7565-478d-a477-073be722c2fa"
        />
        <ErrorReporter />
        <PageLoadAnimation />
        <CartProvider>
          <NavigationHeader initialSession={session} />
          {children}
          <CookieConsent />
        </CartProvider>
        <VisualEditsMessenger />
        <Toaster richColors />
      </body>
    </html>
  );
}