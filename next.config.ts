import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "server.arcgisonline.com",
        pathname: "/ArcGIS/rest/services/World_Imagery/**",
      },
    ],
  },
};

export default nextConfig;
