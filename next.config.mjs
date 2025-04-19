// next.config.mjs
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig = {
  // enable standalone builds
  output: "standalone",

  // turn on React strict mode
  reactStrictMode: true,

  // strip console.* calls in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // your experimental flags
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ["react-icons", "recharts"],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // custom webpack to load SVGs via @svgr/webpack
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

// wrap it with MDX support
export default withMDX(nextConfig);
