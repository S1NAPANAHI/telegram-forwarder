/** @type {import('next').NextConfig} */
const i18nextConfig = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  i18n: i18nextConfig.i18n
};

module.exports = nextConfig;