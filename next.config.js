/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_DISCORD_WEBHOOK: process.env.NEXT_PUBLIC_DISCORD_WEBHOOK || '',
  },
};

module.exports = nextConfig;
