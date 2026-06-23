declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GTAG_CONVERSION_ID =
  process.env.NEXT_PUBLIC_GTAG_CONVERSION_ID ??
  "AW-18167725721/_ZA4CP2oh64cEJn9hddD";
