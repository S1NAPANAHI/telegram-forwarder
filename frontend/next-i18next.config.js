// frontend/next-i18next.config.js
const i18n = {
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localeDetection: true,
  reloadOnPrerender: false
};

module.exports = {
  i18n,
  // Namespaces by page pattern
  ns: ['common'],
  defaultNS: 'common',
  pages: {
    '*': ['common']
  }
};
module.exports.default = module.exports;