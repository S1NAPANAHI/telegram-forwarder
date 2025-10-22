import React from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { GlobeAltIcon } from '@heroicons/react/24/outline'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'compact'
  showIcon?: boolean
  className?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'dropdown', 
  showIcon = true, 
  className = '' 
}) => {
  const router = useRouter()
  const { t, i18n } = useTranslation('common')
  const currentLang = i18n.language || router.locale || 'fa'

  const switchLanguage = async (newLang: string) => {
    try {
      // Change i18n language
      await i18n.changeLanguage(newLang)
      
      // Update router locale
      await router.push(router.asPath, router.asPath, { locale: newLang })
      
      // Store preference in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', newLang)
      }
    } catch (error) {
      console.error('Failed to switch language:', error)
    }
  }

  const languages = [
    { code: 'fa', name: t('persian'), flag: '🇮🇷' },
    { code: 'en', name: t('english'), flag: '🇺🇸' },
  ]

  if (variant === 'toggle') {
    return (
      <motion.button
        onClick={() => switchLanguage(currentLang === 'fa' ? 'en' : 'fa')}
        className={`relative inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {showIcon && (
          <GlobeAltIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {languages.find(lang => lang.code === currentLang)?.flag} {languages.find(lang => lang.code === currentLang)?.name}
        </span>
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 ${className}`}>
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              currentLang === lang.code
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {lang.flag} {lang.code.toUpperCase()}
            {currentLang === lang.code && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                layoutId="activeLanguage"
              />
            )}
          </motion.button>
        ))}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className={`relative inline-block text-left ${className}`}>
      <motion.div
        className="group"
        whileHover={{ scale: 1.02 }}
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          {showIcon && (
            <GlobeAltIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
          <span>{languages.find(lang => lang.code === currentLang)?.flag}</span>
          <span>{languages.find(lang => lang.code === currentLang)?.name}</span>
        </button>

        <motion.div
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
          initial={false}
          animate={{ opacity: 0, y: -10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          <div className="py-1">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors duration-150 ${
                  currentLang === lang.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {currentLang === lang.code && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LanguageSwitcher