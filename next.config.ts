import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reverse-proxy PostHog through our own domain so ad blockers (which block
  // requests to *.posthog.com) can't drop analytics events. The client sends to
  // first-party `/ingest/*`, which we rewrite to PostHog's US ingestion hosts.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // PostHog's /decide endpoint relies on no trailing-slash redirect.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
