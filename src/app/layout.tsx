import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.subiq.io"),
  title: {
    template: "%s | Subiq",
    default: "Subiq - SaaS Subscription Management for Teams",
  },
  description:
    "Track, manage, and optimize your team's software subscriptions. Get automated renewal reminders and full visibility into your SaaS spending.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        {/* Google Consent Mode v2 — start every storage type denied so no analytics
            or ad cookies are set before the visitor consents. Cookiebot updates these
            values automatically once the visitor chooses. Runs before the Cookiebot
            script and before any Google tag (beforeInteractive). data-cookieconsent
            ="ignore" stops autoblocking from blocking this script — it sets no cookies,
            it only declares defaults. */}
        <Script
          id="google-consent-mode"
          strategy="beforeInteractive"
          data-cookieconsent="ignore"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
                functionality_storage: 'denied',
                personalization_storage: 'denied',
                security_storage: 'granted',
                wait_for_update: 500,
              });
              gtag('set', 'ads_data_redaction', true);
              gtag('set', 'url_passthrough', true);
            `,
          }}
        />
        {/* Cookiebot consent manager — must load before any cookie-setting script. */}
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="f0aaae73-8590-439d-8133-dfb078c76584"
          data-blockingmode="auto"
          strategy="beforeInteractive"
        />
        {/* gtag.js — loaded once, shared by Google Analytics (G-) and Google Ads (AW-). */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3BTF1J2LZT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3BTF1J2LZT');
            gtag('config', 'AW-18167725721');
          `}
        </Script>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
