import React, { useState, useEffect, Fragment } from 'react';
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
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps { children: React.ReactNode; }
interface MenuItem { name: string; href: string; icon: React.ComponentType<{ className?: string }>; current?: boolean; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') { setDarkMode(true); document.documentElement.classList.add('dark'); }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode; setDarkMode(next);
    if (next) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  };

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const navigation: MenuItem[] = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('keywordManager'), href: '/keywords', icon: KeyIcon },
    { name: t('channelManager'), href: '/channels', icon: ChatBubbleLeftRightIcon },
    { name: t('destinationManager'), href: '/destinations', icon: PaperAirplaneIcon },
    { name: t('monitoringControl'), href: '/monitoring', icon: ChartBarIcon },
    { name: t('logs'), href: '/logs', icon: DocumentTextIcon },
    { name: t('analytics'), href: '/analytics', icon: ChartBarIcon },
    { name: t('settings'), href: '/settings', icon: CogIcon },
  ];

  const isCurrentPage = (href: string) => router.pathname === href;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('telegramBot')}</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-4 px-2">
              {navigation.map((item) => {
                const Icon = item.icon; const current = isCurrentPage(item.href);
                return (
                  <Link key={item.name} href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${current ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setSidebarOpen(false)}>
                    <Icon className="mr-3 h-5 w-5" />{item.name}
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('telegramBot')}</h1>
            </div>
            <nav className="mt-6 flex-1 px-4">
              {navigation.map((item) => {
                const Icon = item.icon; const current = isCurrentPage(item.href);
                return (
                  <Link key={item.name} href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 transition-all duration-200 ${current ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'}`}>
                    <Icon className="mr-3 h-5 w-5" />{item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <nav className="flex space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard')}</span>
                    {router.pathname !== '/dashboard' && (<>
                      <span className="text-sm text-gray-400">/</span>
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{router.pathname.replace('/', '')}</span>
                    </>)}
                  </nav>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button onClick={toggleDarkMode} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title={darkMode ? t('lightMode') : t('darkMode')}>
                  {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>
                <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                </button>

                {/* Language switcher + user menu */}
                <div className="flex items-center space-x-2">
                  <LanguageSwitcher />
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      {user?.avatar ? (
                        <img src={user.avatar as any} alt={user.username || 'user'} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">{user?.username || t('user')}</p>
                        {user?.telegramId && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">{t('telegram')}</p>
                        )}
                      </div>
                      <ChevronDownIcon className="hidden md:block h-4 w-4" />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="p-3 border-b dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username || t('user')}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                        </div>
                        <div className="py-1">
                          <Menu.Item>{({ active }) => (
                            <button onClick={handleLogout} className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'} group flex items-center w-full px-3 py-2 text-sm transition-colors`}>
                              <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" /> {t('logout')}
                            </button>
                          )}</Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
