import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Helper function to extract hostname from URL
function getHostname(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    // If it's not a full URL, try removing protocol
    const cleaned = url.replace(/^https?:\/\//, "").split("/")[0];
    return cleaned || null;
  }
}

// Build remote patterns - only add if hostname is valid
const remotePatterns = [];
const hostname = getHostname(process.env.R2_PUBLIC_URL);

if (hostname) {
  remotePatterns.push({
    protocol: "https" as const,
    hostname: hostname,
  });
}

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true, // This allows you to use process.env.MY_ENV_VAR with type safety
  },
  cacheComponents: true,
  images: {
    remotePatterns,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
