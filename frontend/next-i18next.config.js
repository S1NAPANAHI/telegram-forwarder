const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fa'], // Add your supported locales here
  },
  localePath: path.resolve('./public/locales'),
};