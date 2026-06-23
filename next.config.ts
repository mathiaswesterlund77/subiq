import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "subiq.io" }],
        destination: "https://www.subiq.io/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
