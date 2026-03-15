/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@boarding/ui',
    '@boarding/tokens',
    '@boarding/domain',
    '@boarding/providers',
    '@boarding/config',
    '@boarding/db',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
