import { Fragment } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation('common');
  const { locale } = router;
  const { language, setLanguage, isRTL, isLoading } = useLanguage();

  const languages = {
    en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
    fa: { name: 'فارسی', flag: '🇮🇷', nativeName: 'Persian' }
  };

  const handleLanguageChange = async (lng: string) => {
    if (lng === locale || isLoading) return;
    
    try {
      await setLanguage(lng as 'fa' | 'en');
      
      // Optional: Save to backend if authenticated
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram-webapp/language`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lng }),
          credentials: 'include'
        });
      } catch (error) {
        console.warn('Failed to save language preference to backend:', error);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLang = languages[locale as keyof typeof languages] || languages.en;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button 
        disabled={isLoading}
        className={clsx(
          'flex items-center px-3 py-2 text-sm rounded-xl transition-all duration-200 border',
          'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl',
          'text-gray-700 dark:text-gray-300',
          'border-gray-200/50 dark:border-gray-600/50',
          'hover:bg-gray-100/70 dark:hover:bg-gray-700/70',
          'hover:border-gray-300/50 dark:hover:border-gray-500/50',
          'focus:outline-none focus:ring-2 focus:ring-telegram-500/20',
          isLoading && 'opacity-50 cursor-not-allowed',
          isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
        )}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4"
          >
            <LanguageIcon className="w-4 h-4" />
          </motion.div>
        ) : (
          <span className="text-base leading-none select-none">{currentLang.flag}</span>
        )}
        <span className="font-medium select-none">{currentLang.name}</span>
        <ChevronDownIcon className={clsx(
          'w-4 h-4 opacity-70 transition-transform',
          isLoading && 'animate-pulse'
        )} />
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
          'absolute mt-2 w-56 origin-top rounded-xl shadow-xl ring-1 ring-black/5 focus:outline-none z-50',
          'bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl',
          'border border-gray-200/50 dark:border-gray-700/50',
          isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
        )}>
          <div className="py-2">
            {Object.entries(languages).map(([code, lang]) => (
              <Menu.Item key={code}>
                {({ active }) => (
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleLanguageChange(code)} 
                    disabled={isLoading || code === locale}
                    className={clsx(
                      'w-full flex items-center px-4 py-3 text-sm transition-colors rounded-lg mx-2 my-1',
                      isRTL ? 'space-x-reverse space-x-3' : 'space-x-3',
                      active && 'bg-gray-100/70 dark:bg-gray-700/70',
                      code === locale && [
                        'bg-telegram-50 dark:bg-telegram-900/20',
                        'text-telegram-700 dark:text-telegram-300 font-medium',
                        'ring-2 ring-telegram-500/20'
                      ],
                      isLoading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="text-lg leading-none select-none">{lang.flag}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {lang.nativeName}
                      </span>
                    </div>
                    {code === locale && (
                      <div className={clsx(
                        'w-2 h-2 bg-telegram-500 rounded-full flex-shrink-0',
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