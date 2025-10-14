// frontend/next-i18next.config.js
const i18n = {
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  // For next-i18next v14/v15 typings, this must be the literal false if present
  localeDetection: false,
};

const config = {
  i18n,
  ns: ['common'],
  defaultNS: 'common',
  pages: {
    '*': ['common'],
  },
  // Belongs at top-level for next-i18next, not inside i18n
  reloadOnPrerender: false,
};

module.exports = config;
module.exports.default = config;
