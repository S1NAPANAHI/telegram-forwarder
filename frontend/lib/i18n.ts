import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import faCommon from '../public/locales/fa/common.json'
import enCommon from '../public/locales/en/common.json'

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        fa: {
          common: faCommon,
        },
        en: {
          common: enCommon,
        },
      },
      lng: 'fa', // Default language
      fallbackLng: {
        'fa': ['fa'],
        'en': ['en', 'fa'],
        'default': ['fa']
      },
      ns: ['common'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      // RTL support configuration
      react: {
        useSuspense: false,
      },
      // Detection options
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
      // Load translations synchronously
      initImmediate: false,
    })
}

// Helper function to get RTL direction for language
export const isRTL = (lng?: string): boolean => {
  const language = lng || i18n.language
  return language === 'fa' || language.startsWith('fa')
}

// Helper function to get text direction
export const getDirection = (lng?: string): 'ltr' | 'rtl' => {
  return isRTL(lng) ? 'rtl' : 'ltr'
}

export default i18n