import { useEffect } from 'react'
import { useRouter } from 'next/router'

export const useRTL = () => {
  const { locale } = useRouter()
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      if (locale === 'fa') {
        html.setAttribute('dir', 'rtl')
        html.setAttribute('lang', 'fa')
      }
    }
  }, [locale])
}
