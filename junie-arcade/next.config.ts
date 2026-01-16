import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
    optimizeCss: true,
  },
};

export default nextConfig;
