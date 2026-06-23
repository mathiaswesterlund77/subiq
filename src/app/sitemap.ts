import type { MetadataRoute } from "next";
import { PRIVACY_LAST_UPDATED, TERMS_LAST_UPDATED } from "@/lib/legal-dates";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.subiq.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: PRIVACY_LAST_UPDATED.iso,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: TERMS_LAST_UPDATED.iso,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
