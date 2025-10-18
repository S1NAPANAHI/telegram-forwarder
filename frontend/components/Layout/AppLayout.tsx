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
  Battery0Icon,
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
            <Battery0Icon className="w-4 h-4" />
            <span className="text-xs ml-1">{batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('telegram_forwarder') || 'Telegram Forwarder'}
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('online') || 'Online'}
              </p>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isDark ? t('light_mode') || 'Light Mode' : t('dark_mode') || 'Dark Mode'}
              >
                {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                title={t('change_language') || 'Change Language'}
              >
                <LanguageIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                />
                {item.name}
                {item.badge && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            {t('logout') || 'Logout'}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title || t('dashboard') || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                <BellIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title || t('dashboard') || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                <BellIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.email || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around py-2">
            {bottomNavItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex flex-col items-center px-3 py-2 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}