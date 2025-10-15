import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation('common');
  const { locale, locales, pathname, query, asPath } = router;
  const [switching, setSwitching] = useState(false);

  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    fa: { name: 'فارسی', flag: '🇮🇷' }
  };

  const setLocale = async (lng: string) => {
    if (lng === locale || switching) return;
    
    setSwitching(true);
    
    try {
      // Apply RTL/LTR immediately for better UX
      const isRTL = ['fa', 'ar', 'he', 'ur'].includes(lng);
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      document.documentElement.classList.toggle('rtl', isRTL);
      document.documentElement.classList.toggle('ltr', !isRTL);

      // Change Next.js locale
      await router.push({ pathname, query }, asPath, { locale: lng });
      
      // Force i18n to change language (this triggers re-render)
      await i18n.changeLanguage(lng);
      
      // Persist choice
      localStorage.setItem('ui_language', lng);
      
      // Optional: call backend to persist on profile (if authenticated)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram-webapp/language`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lng })
        });
        await response.text();
      } catch (error) {
        // Ignore backend errors silently
        console.warn('Failed to save language preference to backend:', error);
      }
      
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setSwitching(false);
    }
  };

  const currentLang = languages[locale as keyof typeof languages] || languages.en;
  const isRTL = locale === 'fa';

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button 
        disabled={switching}
        className={clsx(
          'flex items-center px-3 py-2 text-sm rounded-xl bg-gray-100/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-600/70 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50',
          switching && 'opacity-50 cursor-not-allowed',
          isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
        )}
      >
        {switching ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4"
          >
            <LanguageIcon className="w-4 h-4" />
          </motion.div>
        ) : (
          <span className="text-base leading-none">{currentLang.flag}</span>
        )}
        <span className="font-medium">{currentLang.name}</span>
        <ChevronDownIcon className="w-4 h-4 opacity-70" />
      </Menu.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={clsx(
          'absolute mt-2 w-48 origin-top bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl ring-1 ring-black/5 focus:outline-none z-50',
          isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
        )}>
          <div className="py-2">
            {Object.entries(languages).map(([code, lang]) => (
              <Menu.Item key={code}>
                {({ active }) => (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocale(code)} 
                    disabled={switching || code === locale}
                    className={clsx(
                      'w-full flex items-center px-4 py-3 text-sm transition-colors rounded-lg mx-2 my-1',
                      isRTL ? 'space-x-reverse space-x-3' : 'space-x-3',
                      active && 'bg-gray-100/70 dark:bg-gray-700/70',
                      code === locale && 'bg-telegram-50 dark:bg-telegram-900/20 text-telegram-700 dark:text-telegram-300 font-medium',
                      switching && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {code === locale && (
                      <div className={clsx(
                        'w-2 h-2 bg-telegram-500 rounded-full',
                        isRTL ? 'mr-auto' : 'ml-auto'
                      )} />
                    )}
                  </motion.button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}