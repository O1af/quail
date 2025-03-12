import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ["react-icons", "recharts"],
  },
  async rewrites() {
    return [
      {
        source: "/analytics.js",
        destination: "https://cloud.umami.is/script.js",
      },
    ];
  },
  webpack(config) {
    // Simpler SVGR configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
