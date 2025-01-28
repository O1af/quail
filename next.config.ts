import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  distDir: "build",
  output: "standalone",
};

export default nextConfig;
