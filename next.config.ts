import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: false,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Lets the dev server serve hydration assets/HMR to devices on the LAN
  // (e.g. testing on a phone via http://<lan-ip>:3000) instead of only
  // localhost. Set DEV_LAN_IP in .env.local (gitignored) to your machine's
  // current LAN IP -- it's left out of this file since it'd otherwise get
  // committed to a public repo.
  ...(process.env.DEV_LAN_IP ? { allowedDevOrigins: [process.env.DEV_LAN_IP] } : {}),

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.canada.ca',
      },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
