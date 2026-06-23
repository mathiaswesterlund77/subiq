"use client";

import { useEffect, useRef } from "react";
import { GTAG_CONVERSION_ID } from "@/lib/gtag";
import { markSignupConversionTracked } from "../actions";

/**
 * Fires the Google Ads "signup" conversion exactly once for a brand-new user.
 *
 * Rendered by the dashboard page only when the profile's
 * `signup_conversion_tracked` flag is still false (i.e. first load after signup).
 * The base gtag.js tag (AW-18167725721) is already loaded in the root layout, so
 * here we only emit the event and then persist the flag so it never fires again.
 */
export function SignupConversion() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (typeof window !== "undefined" && window.gtag) {
      // GA4 recommended event — feeds the Analytics "sign_up" key event.
      window.gtag("event", "sign_up", { method: "email" });

      // Google Ads conversion — kept alongside the GA4 event for Ads reporting.
      window.gtag("event", "conversion", {
        send_to: GTAG_CONVERSION_ID,
        value: 1.0,
        currency: "USD",
      });
    }

    void markSignupConversionTracked();
  }, []);

  return null;
}
