import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"]
  }
};

export default nextConfig;
