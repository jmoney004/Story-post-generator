/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "americanbatterytechnology.com" },
      { protocol: "https", hostname: "investors.americanbatterytechnology.com" },
    ],
  },
};

module.exports = nextConfig;
