import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // 1. Add MDX to page extensions so Next.js handles .mdx files as pages
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Enable standalone output for Docker production builds
  output: 'standalone',

  // Disable telemetry
  typescript: {
    // !! WARN !!
    ignoreBuildErrors: false,
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.canada.ca',
      },
    ],
  },
};

// 2. Initialize the MDX wrapper
const withMDX = createMDX({});

// 3. Wrap config with MDX
export default withMDX(nextConfig);
