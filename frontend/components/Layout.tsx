import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

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
  const { t } = useTranslation('common');
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navigation: MenuItem[] = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('keywords'), href: '/keywords', icon: KeyIcon },
    { name: t('channels'), href: '/channels', icon: ChatBubbleLeftRightIcon },
    { name: t('destinations'), href: '/destinations', icon: PaperAirplaneIcon },
    { name: t('monitoring'), href: '/monitoring', icon: ChartBarIcon },
    { name: t('logs'), href: '/logs', icon: DocumentTextIcon },
    { name: t('analytics'), href: '/analytics', icon: ChartBarIcon },
    { name: t('settings'), href: '/settings', icon: CogIcon },
  ];

  const isCurrentPage = (href: string) => {
    return router.pathname === href;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          
          <div className="fixed left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('telegramBot')}
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="mt-4 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const current = isCurrentPage(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                      current
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center h-16 px-6 border-b dark:border-gray-700">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('telegramBot')}
              </h1>
            </div>
            
            <nav className="mt-6 flex-1 px-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const current = isCurrentPage(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 transition-all duration-200 ${
                      current
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top header */}
          <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                
                <div className="ml-4 lg:ml-0">
                  <nav className="flex space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t('dashboard')}
                    </span>
                    {router.pathname !== '/dashboard' && (
                      <>
                        <span className="text-sm text-gray-400">/</span>
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {router.pathname.replace('/', '')}
                        </span>
                      </>
                    )}
                  </nav>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Theme toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title={darkMode ? t('lightMode') : t('darkMode')}
                >
                  {darkMode ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {t('admin')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;