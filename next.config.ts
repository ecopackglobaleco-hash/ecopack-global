import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Image optimization: serve modern formats (AVIF preferred, WebP fallback)
  // Validates: Requirements 7.4, 7.5, 7.6
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression enabled by default in Next.js production builds
  compress: true,

  // Experimental optimizations for performance
  experimental: {
    optimizeCss: true,
  },

  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},

  // Custom webpack configuration for optimal chunk splitting
  // Validates: Requirements 7.1, 7.2, 7.7
  webpack: (config, { isServer }) => {
    if (!isServer && config.optimization) {
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          // Separate Three.js into its own chunk (large library, loaded on demand)
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: "vendor-three",
            chunks: "async",
            priority: 30,
            reuseExistingChunk: true,
          },
          // GSAP animation library in its own chunk
          gsap: {
            test: /[\\/]node_modules[\\/]gsap[\\/]/,
            name: "vendor-gsap",
            chunks: "all",
            priority: 25,
            reuseExistingChunk: true,
          },
          // React/React-DOM framework chunk
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "vendor-framework",
            chunks: "all",
            priority: 40,
            reuseExistingChunk: true,
          },
          // Form-related libraries
          forms: {
            test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
            name: "vendor-forms",
            chunks: "async",
            priority: 20,
            reuseExistingChunk: true,
          },
          // Default vendor chunk for remaining dependencies
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Add rule for loading GLB/GLTF 3D model files as assets
    config.module?.rules?.push({
      test: /\.(glb|gltf)$/,
      type: "asset/resource",
    });

    return config;
  },

  // HTTP headers for asset caching
  async headers() {
    return [
      {
        // Cache static assets (models) for 1 year with immutable
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache static images for 1 year with immutable
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
