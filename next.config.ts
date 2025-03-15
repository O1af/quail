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
        source: "/analytics.js",
        destination: "https://cloud.umami.is/script.js",
      },
    ];
  },
  // Add scripts properly to your CSP
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cloud.umami.is; connect-src 'self' https://cloud.umami.is;",
          },
        ],
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
