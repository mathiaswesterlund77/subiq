import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/dashboard",
        "/subscriptions",
        "/settings",
        "/api",
        "/auth",
        "/login",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.subiq.io"}/sitemap.xml`,
  };
}
