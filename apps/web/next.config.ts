import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tumbfolio/domain", "@tumbfolio/render-contracts"]
};

export default nextConfig;
