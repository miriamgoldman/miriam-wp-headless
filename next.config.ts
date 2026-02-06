import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required: Enable custom cache handler
  cacheHandler: require.resolve('./cacheHandler'),
  cacheMaxMemorySize: 0, // Disable in-memory caching to use custom handler

  // Image optimization for WordPress media
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.pantheonsite.io',
        pathname: '/wp-content/uploads/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
