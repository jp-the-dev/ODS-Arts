import type { NextConfig } from "next";

/**
 * Catalogue images are uploaded through the admin and served by Laravel from
 * /storage on the API host, so the image optimizer has to be told that host is
 * allowed. Deriving it from the API URL keeps the two from drifting apart when
 * the domain changes.
 */
const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1')

const isLocalApi = ['localhost', '127.0.0.1', '[::1]'].includes(api.hostname)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: api.protocol.replace(':', '') as 'http' | 'https',
        hostname: api.hostname,
        port: api.port,
        pathname: '/storage/**',
      },
      // A browser treats localhost and 127.0.0.1 as different hosts, and either
      // may end up in an image URL depending on APP_URL, so allow both locally.
      ...(isLocalApi
        ? (['localhost', '127.0.0.1'] as const).map((hostname) => ({
            protocol: 'http' as const,
            hostname,
            port: api.port,
            pathname: '/storage/**',
          }))
        : []),
    ],
    // Next 16 refuses to optimize an image whose host resolves to a local or
    // private address, as a guard against server-side request forgery — and it
    // rejects the request before remotePatterns is consulted, so a matching
    // pattern is not enough on its own. In development the API genuinely is on
    // localhost, so the guard has to be lifted; keying it off the API host
    // rather than NODE_ENV means it stays on for any real domain, including
    // when running a production build locally.
    dangerouslyAllowLocalIP: isLocalApi,
  },
};

export default nextConfig;
