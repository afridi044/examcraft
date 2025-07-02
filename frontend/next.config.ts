import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Docker optimization: Enable standalone output for minimal production builds
  output: "standalone",

  // DEVELOPMENT PERFORMANCE OPTIMIZATIONS
  ...(process.env.NODE_ENV === "development" &&
    {
      // Skip type checking in dev for speed (handled by main config above)
    }),

  // Performance optimizations
  experimental: {
    // Enable optimized package imports for better bundle size
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-query",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "framer-motion",
      "chart.js",
    ],
    // Enable concurrent features for better performance
    cpus: Math.max(1, require("os").cpus().length - 1),
  },

  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  // FAST REFRESH OPTIMIZATION: Prevent multiple rebuilds
  ...(process.env.NODE_ENV === "development" && {
    onDemandEntries: {
      // Extend the period for disposing inactive pages
      maxInactiveAge: 60 * 1000, // 1 minute
      // Reduce the number of pages that should be kept simultaneously
      pagesBufferLength: 2,
    },
  }),

  // Image optimization
  images: {
    // Enable modern image formats
    formats: ["image/webp", "image/avif"],
    // Optimize for better performance
    minimumCacheTTL: 86400, // 24 hours
  },

  // Enable gzip compression
  compress: true,

  // Optimize page loading
  poweredByHeader: false,

  // DEVELOPMENT-SPECIFIC OPTIMIZATIONS
  ...(process.env.NODE_ENV === "development" && {
    // Reduce bundle analysis overhead
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Optimize development builds
        config.optimization = {
          ...config.optimization,
          // Disable splitChunks in development for faster rebuilds
          splitChunks: false,
        };

        // OPTIMIZED: Reduce file watching overhead and prevent multiple rebuilds
        config.watchOptions = {
          ignored: [
            "**/node_modules/**",
            "**/.git/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
            "**/.env*",
            "**/public/**",
          ],
          aggregateTimeout: 500, // Increased to batch file changes
          poll: false, // Disable polling to prevent excessive rebuilds
        };

        // FAST REFRESH OPTIMIZATION: Reduce rebuild triggers
        config.cache = {
          type: "memory",
          // Prevent cache invalidation on every file change
          buildDependencies: {
            config: [__filename],
          },
        };

        // Optimize module resolution for faster rebuilds
        config.resolve = {
          ...config.resolve,
          symlinks: false, // Disable symlink resolution for speed
        };
      }
      return config;
    },
  }),
};

export default nextConfig;
