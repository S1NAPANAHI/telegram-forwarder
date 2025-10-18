import React, { useState, useEffect, Fragment, useCallback } from 'react';
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
  EyeIcon,
  RssIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { direction, isRTL } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setDarkMode(isDark);
    setMounted(true);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const navigation: MenuItem[] = [
    { name: t('dashboard') || 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Discovery', href: '/discovery', icon: MagnifyingGlassIcon },
    { name: 'Live Feed', href: '/feed', icon: RssIcon },
    { name: t('channelManager') || 'Channels', href: '/channels', icon: ChatBubbleLeftRightIcon },
    { name: t('destinationManager') || 'Destinations', href: '/destinations', icon: PaperAirplaneIcon },
    { name: t('keywordManager') || 'Keywords', href: '/keywords', icon: KeyIcon },
    { name: t('monitoringControl') || 'Monitoring', href: '/monitoring', icon: EyeIcon },
    { name: t('analytics') || 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: t('logs') || 'Logs', href: '/logs', icon: DocumentTextIcon },
    { name: t('settings') || 'Settings', href: '/settings', icon: CogIcon },
    { name: 'Telegram Client', href: '/telegram-client', icon: CloudArrowUpIcon },
  ];

  const isCurrentPage = (href: string) => router.pathname === href;

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  // Sidebar variants for animations
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: isRTL ? 300 : -300 }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <div className={clsx('min-h-screen', darkMode ? 'dark' : '')}>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 min-h-screen">
        
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={closeSidebar}
            />
          )}
        </AnimatePresence>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={clsx(
                'fixed top-0 w-80 h-full z-50 lg:hidden',
                'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl',
                'border-gray-200/50 dark:border-gray-700/50',
                isRTL ? 'right-0 border-l' : 'left-0 border-r'
              )}
            >
              {/* Mobile sidebar header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className={clsx('flex items-center', isRTL ? 'space-x-reverse space-x-3' : 'space-x-3')}>
                  <div className="w-10 h-10 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t('telegramBot') || 'Telegram Bot'}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('messageForwarder') || 'Message Forwarder'}
                    </p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeSidebar}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </motion.button>
              </div>
              
              {/* Mobile navigation */}
              <nav className="mt-6 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin">
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
                          'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative touch-friendly',
                          current 
                            ? 'bg-gradient-to-r from-telegram-50 to-telegram-100 dark:from-telegram-900/20 dark:to-telegram-800/20 text-telegram-700 dark:text-telegram-300 shadow-sm border border-telegram-200/50 dark:border-telegram-700/50' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white'
                        )}
                        onClick={closeSidebar}
                      >
                        <Icon className={clsx(
                          'h-5 w-5 transition-colors flex-shrink-0',
                          isRTL ? 'ml-3' : 'mr-3',
                          current 
                            ? 'text-telegram-600 dark:text-telegram-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        )} />
                        <span className="truncate">{item.name}</span>
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

        {/* Desktop sidebar - Fixed position, consistent placement */}
        <div className={clsx(
          'hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-30',
          isRTL ? 'lg:right-0' : 'lg:left-0'
        )}>
          <div className={clsx(
            'flex flex-col flex-grow',
            'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl',
            'border-gray-200/50 dark:border-gray-700/50',
            isRTL ? 'border-l' : 'border-r'
          )}>
            {/* Desktop sidebar header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center h-20 px-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0"
            >
              <div className={clsx('flex items-center w-full', isRTL ? 'space-x-reverse space-x-3' : 'space-x-3')}>
                <div className="w-10 h-10 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {t('telegramBot') || 'Telegram Bot'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {t('messageForwarder') || 'Message Forwarder'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Desktop navigation */}
            <nav className="mt-6 flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const current = isCurrentPage(item.href);
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
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
                        'h-5 w-5 transition-colors flex-shrink-0',
                        isRTL ? 'ml-3' : 'mr-3',
                        current 
                          ? 'text-telegram-600 dark:text-telegram-400' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                      )} />
                      <span className="truncate">{item.name}</span>
                      {current && (
                        <motion.div
                          layoutId="activeDesktopTab"
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

            {/* Desktop sidebar footer */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                © 2024 Telegram Forwarder
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className={clsx(
          'transition-all duration-300',
          isRTL ? 'lg:pr-72' : 'lg:pl-72'
        )}>
          {/* Top header bar */}
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              {/* Left section */}
              <div className={clsx('flex items-center', isRTL ? 'space-x-reverse space-x-4' : 'space-x-4')}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-friendly"
                >
                  <Bars3Icon className="h-6 w-6" />
                </motion.button>
                
                {/* Breadcrumb */}
                <div className="hidden sm:block">
                  <nav className={clsx(
                    'flex items-center text-sm',
                    isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'
                  )}>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('dashboard') || 'Dashboard'}
                    </span>
                    {router.pathname !== '/dashboard' && (
                      <>
                        <ChevronDownIcon className={clsx(
                          'h-4 w-4 text-gray-400',
                          isRTL ? 'rotate-90' : '-rotate-90'
                        )} />
                        <span className="text-gray-900 dark:text-white font-medium capitalize truncate">
                          {router.pathname === '/discovery' ? 'Discovery' : 
                           router.pathname === '/feed' ? 'Live Feed' : 
                           (t(router.pathname.replace('/', '')) || router.pathname.replace('/', ''))}
                        </span>
                      </>
                    )}
                  </nav>
                </div>
              </div>

              {/* Right section */}
              <div className={clsx('flex items-center', isRTL ? 'space-x-reverse space-x-3' : 'space-x-3')}>
                {/* Theme toggle */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-friendly" 
                  title={darkMode ? t('lightMode') || 'Light Mode' : t('darkMode') || 'Dark Mode'}
                >
                  {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </motion.button>
                
                {/* Notifications */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-friendly"
                >
                  <BellIcon className="h-5 w-5" />
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={clsx(
                      'absolute h-2 w-2 bg-red-500 rounded-full',
                      isRTL ? '-bottom-0.5 -left-0.5' : '-top-0.5 -right-0.5'
                    )}
                  />
                </motion.button>

                {/* Language switcher */}
                <LanguageSwitcher />
                
                {/* User menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className={clsx(
                    'flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-xl transition-all duration-200',
                    isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                  )}>
                    <div className="h-8 w-8 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden md:block text-left min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user?.username || t('user') || 'User'}
                      </p>
                      {user?.telegramId && (
                        <p className="text-xs text-telegram-600 dark:text-telegram-400 truncate">
                          {t('telegram') || 'Telegram'}
                        </p>
                      )}
                    </div>
                    <ChevronDownIcon className="hidden md:block h-4 w-4 flex-shrink-0" />
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
                      'absolute mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl ring-1 ring-black/5 focus:outline-none z-50',
                      isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                    )}>
                      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user?.username || t('user') || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                              <ArrowRightOnRectangleIcon className={clsx(
                                'h-4 w-4 flex-shrink-0', 
                                isRTL ? 'ml-2' : 'mr-2'
                              )} /> 
                              {t('logout') || 'Logout'}
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </motion.header>

          {/* Main content */}
          <main className="p-4 lg:p-6 mobile-content">
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