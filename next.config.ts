import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
  },
  async headers() {
    // Statische Dateien aus public/ haben keinen Hash im Namen: 7 Tage cachen, danach im Hintergrund erneuern.
    const staticCache = { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }
    return [
      { source: '/images/:path*', headers: [staticCache] },
      { source: '/video/:path*', headers: [staticCache] },
      { source: '/brand/:path*', headers: [staticCache] },
      { source: '/:file(og.*\\.jpg|icon-.*\\.png)', headers: [staticCache] },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
