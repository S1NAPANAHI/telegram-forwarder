import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps { 
  children: React.ReactNode; 
}

interface MenuItem { 
  name: string; 
  href: string; 
  icon: React.ComponentType<{ className?: string }>; 
  current?: boolean; 
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  // Handle theme and RTL initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') { 
      setDarkMode(true); 
      document.documentElement.classList.add('dark'); 
    }
  }, []);

  // Handle RTL direction changes when locale changes
  useEffect(() => {
    const currentLocale = router.locale || i18n.language;
    const isRTLLang = ['fa', 'ar', 'he', 'ur'].includes(currentLocale);
    
    // Set document direction
    document.documentElement.setAttribute('dir', isRTLLang ? 'rtl' : 'ltr');
    document.documentElement.classList.toggle('rtl', isRTLLang);
    document.documentElement.classList.toggle('ltr', !isRTLLang);
    
    setIsRTL(isRTLLang);
  }, [router.locale, i18n.language]);

  const toggleDarkMode = () => {
    const next = !darkMode; 
    setDarkMode(next);
    if (next) { 
      document.documentElement.classList.add('dark'); 
      localStorage.setItem('theme', 'dark'); 
    } else { 
      document.documentElement.classList.remove('dark'); 
      localStorage.setItem('theme', 'light'); 
    }
  };

  const handleLogout = async () => { 
    await logout(); 
    router.push('/login'); 
  };

  const navigation: MenuItem[] = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: 'Discovery', href: '/discovery', icon: MagnifyingGlassIcon },
    { name: t('channelManager'), href: '/channels', icon: ChatBubbleLeftRightIcon },
    { name: t('destinationManager'), href: '/destinations', icon: PaperAirplaneIcon },
    { name: t('keywordManager'), href: '/keywords', icon: KeyIcon },
    { name: t('monitoringControl'), href: '/monitoring', icon: EyeIcon },
    { name: t('analytics'), href: '/analytics', icon: ChartBarIcon },
    { name: t('logs'), href: '/logs', icon: DocumentTextIcon },
    { name: t('settings'), href: '/settings', icon: CogIcon },
  ];

  const isCurrentPage = (href: string) => router.pathname === href;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 min-h-screen">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: isRTL ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 300 : -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={clsx(
                'fixed top-0 w-80 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl z-50 lg:hidden border-gray-200/50 dark:border-gray-700/50',
                isRTL ? 'right-0 border-l' : 'left-0 border-r'
              )}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className={clsx('flex items-center', isRTL ? 'space-x-reverse space-x-3' : 'space-x-3')}>
                  <div className="w-10 h-10 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('telegramBot')}
                  </h1>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(false)} 
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </motion.button>
              </div>
              
              <nav className="mt-6 px-6 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  const current = isCurrentPage(item.href);
                  
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={clsx(
                          'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative',
                          current 
                            ? 'bg-gradient-to-r from-telegram-50 to-telegram-100 dark:from-telegram-900/20 dark:to-telegram-800/20 text-telegram-700 dark:text-telegram-300 shadow-sm border border-telegram-200/50 dark:border-telegram-700/50' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className={clsx(
                          'h-5 w-5 transition-colors',
                          isRTL ? 'ml-3' : 'mr-3',
                          current 
                            ? 'text-telegram-600 dark:text-telegram-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        )} />
                        {item.name}
                        {current && (
                          <motion.div
                            layoutId="activeMobileTab"
                            className={clsx(
                              'absolute w-2 h-2 bg-telegram-500 rounded-full',
                              isRTL ? 'left-4' : 'right-4'
                            )}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <div className={clsx(
          'hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0',
          isRTL ? 'lg:right-0' : 'lg:left-0'
        )}>
          <div className={clsx(
            'flex flex-col flex-grow bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-gray-200/50 dark:border-gray-700/50',
            isRTL ? 'border-l' : 'border-r'
          )}>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center h-20 px-6 border-b border-gray-200/50 dark:border-gray-700/50"
            >
              <div className={clsx('flex items-center', isRTL ? 'space-x-reverse space-x-3' : 'space-x-3')}>
                <div className="w-10 h-10 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('telegramBot')}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('messageForwarder') || 'Message Forwarder'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <nav className="mt-8 flex-1 px-6 space-y-2 overflow-y-auto">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const current = isCurrentPage(item.href);
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={clsx(
                        'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative',
                        current 
                          ? 'bg-gradient-to-r from-telegram-50 to-telegram-100 dark:from-telegram-900/20 dark:to-telegram-800/20 text-telegram-700 dark:text-telegram-300 shadow-sm border border-telegram-200/50 dark:border-telegram-700/50' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                      )}
                    >
                      <Icon className={clsx(
                        'h-5 w-5 transition-colors',
                        isRTL ? 'ml-3' : 'mr-3',
                        current 
                          ? 'text-telegram-600 dark:text-telegram-400' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                      )} />
                      {item.name}
                      {current && (
                        <motion.div
                          layoutId="activeTab"
                          className={clsx(
                            'absolute w-2 h-2 bg-telegram-500 rounded-full',
                            isRTL ? 'left-4' : 'right-4'
                          )}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className={clsx(isRTL ? 'lg:pr-72' : 'lg:pl-72')}>
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <div className={clsx('flex items-center', isRTL ? 'space-x-reverse space-x-4' : 'space-x-4')}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(true)} 
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Bars3Icon className="h-6 w-6" />
                </motion.button>
                
                <div className="hidden sm:block">
                  <nav className={clsx(
                    'flex items-center text-sm',
                    isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'
                  )}>
                    <span className="text-gray-500 dark:text-gray-400">{t('dashboard')}</span>
                    {router.pathname !== '/dashboard' && (
                      <>
                        <ChevronDownIcon className={clsx(
                          'h-4 w-4 text-gray-400',
                          isRTL ? 'rotate-90' : '-rotate-90'
                        )} />
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {router.pathname === '/discovery' ? 'Discovery' : (t(router.pathname.replace('/', '')) || router.pathname.replace('/', ''))}
                        </span>
                      </>
                    )}
                  </nav>
                </div>
              </div>

              <div className={clsx('flex items-center', isRTL ? 'space-x-reverse space-x-3' : 'space-x-3')}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleDarkMode} 
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                  title={darkMode ? t('lightMode') : t('darkMode')}
                >
                  {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <BellIcon className="h-5 w-5" />
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={clsx(
                      'absolute h-3 w-3 bg-red-500 rounded-full',
                      isRTL ? '-bottom-1 -left-1' : '-top-1 -right-1'
                    )}
                  />
                </motion.button>

                <div className={clsx('flex items-center', isRTL ? 'space-x-reverse space-x-3' : 'space-x-3')}>
                  <LanguageSwitcher />
                  
                  <Menu as="div" className="relative">
                    <Menu.Button className={clsx(
                      'flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-xl transition-all duration-200',
                      isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                    )}>
                      <div className="h-8 w-8 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-xl flex items-center justify-center shadow-lg">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">{user?.username || t('user')}</p>
                        {user?.telegramId && (
                          <p className="text-xs text-telegram-600 dark:text-telegram-400">{t('telegram')}</p>
                        )}
                      </div>
                      <ChevronDownIcon className="hidden md:block h-4 w-4" />
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
                        'absolute mt-2 w-56 origin-top bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl ring-1 ring-black/5 focus:outline-none',
                        isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                      )}>
                        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.username || t('user')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email || ''}
                          </p>
                        </div>
                        <div className="py-2">
                          <Menu.Item>
                            {({ active }) => (
                              <button 
                                onClick={handleLogout} 
                                className={clsx(
                                  'group flex items-center w-full px-4 py-2 text-sm transition-colors rounded-lg mx-2',
                                  active 
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                                    : 'text-gray-700 dark:text-gray-300'
                                )}
                              >
                                <ArrowRightOnRectangleIcon className={clsx('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} /> 
                                {t('logout')}
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </motion.header>

          <main className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;