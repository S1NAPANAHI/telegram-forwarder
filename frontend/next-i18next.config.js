// frontend/next-i18next.config.js
const config = {
  i18n: {
    locales: ['fa', 'en'],
    defaultLocale: 'fa',
    localeDetection: true,
  },
  ns: ['common'],
  defaultNS: 'common',
  pages: {
    '*': ['common'],
  },
  reloadOnPrerender: false,
  // Add support for locale-specific routing
  localePath: './public/locales',
  // Enable strict mode for better performance
  strictMode: true,
  // Enable saveMissing in development
  saveMissing: process.env.NODE_ENV === 'development',
  // Fallback language
  fallbackLng: {
    'fa': ['fa'],
    'en': ['en', 'fa'],
    'default': ['fa']
  },
  // Load namespaces for specific pages
  nonExplicitSupportedLngs: true,
};

module.exports = config;