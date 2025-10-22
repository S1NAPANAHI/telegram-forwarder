import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import faCommon from '../public/locales/fa/common.json'

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        fa: {
          common: faCommon,
        },
      },
      lng: 'fa',
      fallbackLng: 'fa',
      ns: ['common'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
    })
}

export default i18n
