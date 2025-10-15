// frontend/next-i18next.config.js
const config = {
  i18n: {
    locales: ['fa', 'en'],
    defaultLocale: 'fa',
    // removed localeDetection to satisfy next-i18next UserConfig types
  },
  ns: ['common'],
  defaultNS: 'common',
  pages: {
    '*': ['common'],
  },
  reloadOnPrerender: false,
};

module.exports = config;