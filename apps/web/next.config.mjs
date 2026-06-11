import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@rehab/ui',
    '@rehab/tokens',
    '@rehab/three',
    '@rehab/types',
  ],
  experimental: {
    optimizePackageImports: ['@material/web', 'three', '@react-three/drei'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sketchfab.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
