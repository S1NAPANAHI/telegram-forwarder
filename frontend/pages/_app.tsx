import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { appWithTranslation } from 'next-i18next'
import { AuthProvider } from '../context/AuthContext'
import nextI18NextConfig from '../next-i18next.config.js'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { locale } = router

  // Handle direction and language changes
  useEffect(() => {
    const isRTL = locale === 'fa'
    const direction = isRTL ? 'rtl' : 'ltr'
    
    // Set document direction and lang
    document.documentElement.dir = direction
    document.documentElement.lang = locale || 'en'
    document.documentElement.setAttribute('data-direction', direction)
    
    // Set body direction and classes
    document.body.setAttribute('dir', direction)
    document.body.setAttribute('lang', locale || 'en')
    
    // Update CSS classes for Tailwind RTL support
    if (isRTL) {
      document.documentElement.classList.add('rtl')
      document.documentElement.classList.remove('ltr')
      document.body.classList.add('rtl')
      document.body.classList.remove('ltr')
    } else {
      document.documentElement.classList.add('ltr')
      document.documentElement.classList.remove('rtl')
      document.body.classList.add('ltr')
      document.body.classList.remove('rtl')
    }
    
    console.log(`Language changed to ${locale}, direction: ${direction}`)
  }, [locale])

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default appWithTranslation(MyApp, nextI18NextConfig)