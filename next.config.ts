import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "americanbatterytechnology.com" },
      { protocol: "https", hostname: "investors.americanbatterytechnology.com" },
    ],
  },
};

export default nextConfig;
