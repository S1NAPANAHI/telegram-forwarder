import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'next-i18next';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  DocumentTextIcon,
  FunnelIcon,
  MapPinIcon,
  WifiIcon,
  SignalIcon,
  BatteryIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  active?: boolean;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { name: t('dashboard') || 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: t('channels') || 'Channels', href: '/channels', icon: ChatBubbleLeftRightIcon },
    { name: t('discovery') || 'Discovery', href: '/discovery', icon: MagnifyingGlassIcon, badge: 3 },
    { name: t('keywords') || 'Keywords', href: '/keywords', icon: FunnelIcon },
    { name: t('destinations') || 'Destinations', href: '/destinations', icon: MapPinIcon },
    { name: t('analytics') || 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: t('feed') || 'Feed', href: '/feed', icon: DocumentTextIcon },
    { name: t('settings') || 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Bottom navigation (mobile)
  const bottomNavItems: NavigationItem[] = [
    { name: t('home') || 'Home', href: '/dashboard', icon: HomeIcon },
    { name: t('channels') || 'Channels', href: '/channels', icon: ChatBubbleLeftRightIcon },
    { name: t('discovery') || 'Discovery', href: '/discovery', icon: MagnifyingGlassIcon, badge: 3 },
    { name: t('analytics') || 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: t('more') || 'More', href: '#', icon: EllipsisVerticalIcon },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLocale = localStorage.getItem('locale') || router.locale || 'en';
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    
    setCurrentLocale(savedLocale);
    
    if (savedLocale === 'fa') {
      document.body.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
      document.body.classList.add('ltr');
    }

    // Network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router.locale]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'fa' : 'en';
    setCurrentLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    router.push(router.pathname, router.pathname, { locale: newLocale });
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    router.push('/auth/login');
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return router.pathname === '/' || router.pathname === '/dashboard';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Mobile Status Bar */}
      <div className="lg:hidden bg-black text-white text-xs px-4 py-1 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {!isOnline && (
            <span className="text-red-400 text-xs">{t('offline') || 'Offline'}</span>
          )}
          <div className="flex items-center space-x-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-1 h-2 rounded-full ${i < 3 ? 'bg-white' : 'bg-gray-600'}`} />
            ))}
          </div>
          <WifiIcon className={`w-4 h-4 ${isOnline ? 'text-white' : 'text-gray-500'}`} />
          <div className="flex items-center">
            <BatteryIcon className="w-4 h-4" />
            <span className="text-xs ml-1">{batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-xl flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('telegramForwarder') || 'Telegram Forwarder'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email || t('guestUser') || 'Guest User'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-telegram-50 dark:bg-telegram-900/20 text-telegram-600 dark:text-telegram-400 border border-telegram-200 dark:border-telegram-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <item.icon className={`w-5 h-5 ${
                      isActive 
                        ? 'text-telegram-600 dark:text-telegram-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? (
                  <SunIcon className="w-5 h-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LanguageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="font-medium text-sm">{t('logout') || 'Logout'}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
                
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-lg flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {title || t('telegramForwarder')}
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>
                
                {user && (
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserCircleIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title || t('dashboard')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('welcomeBack')} {user?.email?.split('@')[0] || t('user')}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? (
                    <SunIcon className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <MoonIcon className="w-6 h-6 text-gray-600" />
                  )}
                </button>
                
                <button
                  onClick={toggleLanguage}
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LanguageIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
                
                <button className="relative p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>
                
                {user && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse pl-4 border-l border-gray-200 dark:border-gray-700">
                    <UserCircleIcon className="w-10 h-10 text-gray-700 dark:text-gray-300" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {user.email?.split('@')[0] || t('user')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('online') || 'Online'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto pb-20 lg:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: currentLocale === 'fa' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: currentLocale === 'fa' ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 40 }}
            className={`lg:hidden fixed top-0 bottom-0 w-80 bg-white dark:bg-gray-800 z-50 shadow-2xl ${
              currentLocale === 'fa' ? 'right-0' : 'left-0'
            }`}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-xl flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('telegramForwarder')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email || t('guestUser')}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigationItems.map((item, index) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: currentLocale === 'fa' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={item.href}>
                      <div
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-telegram-50 dark:bg-telegram-900/20 text-telegram-600 dark:text-telegram-400 border border-telegram-200 dark:border-telegram-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <item.icon className={`w-6 h-6 ${
                            isActive 
                              ? 'text-telegram-600 dark:text-telegram-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={toggleTheme}
                    className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {isDark ? (
                      <SunIcon className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <MoonIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleLanguage}
                    className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LanguageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 rtl:space-x-reverse p-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                  <span className="font-medium">{t('logout')}</span>
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
        <div className="flex items-center justify-around px-4 py-2">
          {bottomNavItems.map((item) => {
            const isActive = item.href === '#' ? false : isActiveRoute(item.href);
            return (
              <div key={item.name} className="relative">
                {item.href === '#' ? (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col items-center p-2 min-w-[60px]"
                  >
                    <div className="relative">
                      <item.icon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <span className="text-xs mt-1 font-medium text-gray-500 dark:text-gray-400">
                      {item.name}
                    </span>
                  </button>
                ) : (
                  <Link href={item.href}>
                    <div className="flex flex-col items-center p-2 min-w-[60px]">
                      <div className="relative">
                        <item.icon className={`w-6 h-6 ${
                          isActive 
                            ? 'text-telegram-600 dark:text-telegram-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        {item.badge && (
                          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${
                        isActive 
                          ? 'text-telegram-600 dark:text-telegram-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {item.name}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="bottomNavIndicator"
                          className="absolute -bottom-1 w-8 h-0.5 bg-telegram-600 dark:bg-telegram-400 rounded-full"
                        />
                      )}
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}