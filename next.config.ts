import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Remove swcMinify as it's now unrecognized in Next.js 15
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
        source: "/um.js",
        destination: "https://cloud.umami.is/script.js",
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
