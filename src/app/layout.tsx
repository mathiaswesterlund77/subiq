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
        {/* gtag.js — loaded only AFTER Cookiebot consent so no tracking cookies
            are set before the visitor consents. The CookiebotOnAccept event fires
            both on first consent and on returning visits where consent was already
            stored. Google Consent Mode v2 defaults (set above) remain in effect
            until consent is given, so the first gtag() calls respect the grant. */}
        <Script
          id="gtag-consent-loader"
          strategy="afterInteractive"
          data-cookieconsent="ignore"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var loaded = false;
                function boot(){
                  if(loaded) return;
                  loaded = true;
                  var s = document.createElement('script');
                  s.async = true;
                  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-3BTF1J2LZT';
                  document.head.appendChild(s);
                  s.onload = function(){
                    gtag('js', new Date());
                    gtag('config', 'G-3BTF1J2LZT');
                    gtag('config', 'AW-18167725721');
                  };
                }
                window.addEventListener('CookiebotOnAccept', function(){
                  if(Cookiebot.consent.statistics || Cookiebot.consent.marketing) boot();
                });
                // Returning visitor — consent already stored, event may have fired.
                if(typeof Cookiebot !== 'undefined' && Cookiebot.consented &&
                   (Cookiebot.consent.statistics || Cookiebot.consent.marketing)) boot();
              })();
            `,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
