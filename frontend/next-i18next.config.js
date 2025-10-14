// frontend/next-i18next.config.js
const i18n = {
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  // removed localeDetection to satisfy next-i18next UserConfig types
};

const config = {
  i18n,
  ns: ['common'],
  defaultNS: 'common',
  pages: {
    '*': ['common'],
  },
  reloadOnPrerender: false,
};

module.exports = config;
module.exports.default = config;
