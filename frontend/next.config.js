/** @type {import('next').NextConfig} */
const i18nextConfig = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  // Only valid Next.js i18n keys here
  i18n: {
    locales: i18nextConfig.i18n.locales,
    defaultLocale: i18nextConfig.i18n.defaultLocale,
    // omit localeDetection to satisfy Next.js 15 expectations
  },
};

module.exports = nextConfig;
