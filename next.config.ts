import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true, // This allows you to use process.env.MY_ENV_VAR with type safety
  },
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.R2_PUBLIC_URL_DEV?.replace(/^https?:\/\//, "") || "",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
