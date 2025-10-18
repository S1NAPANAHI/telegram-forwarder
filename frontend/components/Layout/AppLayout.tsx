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

      {/* The rest of the file remains unchanged */}
