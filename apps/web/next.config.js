/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@gateshare/ui',
    '@gateshare/tokens',
    '@gateshare/domain',
    '@gateshare/providers',
    '@gateshare/config',
    '@gateshare/db',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
