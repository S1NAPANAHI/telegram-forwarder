import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { isRTL, getDirection } from './i18n'

export const useRTL = () => {
  const { locale } = useRouter()
  const { i18n } = useTranslation()
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      const currentLang = locale || i18n.language
      const direction = getDirection(currentLang)
      const rtl = isRTL(currentLang)
      
      // Set direction and language attributes
      html.setAttribute('dir', direction)
      html.setAttribute('lang', currentLang)
      
      // Add RTL class for additional styling
      if (rtl) {
        html.classList.add('rtl')
        html.classList.remove('ltr')
      } else {
        html.classList.add('ltr')
        html.classList.remove('rtl')
      }
      
      // Set font family based on language
      if (currentLang === 'fa') {
        html.style.fontFamily = "'Vazirmatn', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      } else {
        html.style.fontFamily = "'Inter', 'Vazirmatn', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }
      
      // Update body classes for better styling control
      document.body.classList.toggle('persian', currentLang === 'fa')
      document.body.classList.toggle('english', currentLang === 'en')
    }
  }, [locale, i18n.language])
  
  return {
    isRTL: isRTL(locale || i18n.language),
    direction: getDirection(locale || i18n.language),
    language: locale || i18n.language
  }
}