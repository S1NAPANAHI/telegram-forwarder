import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import {
  CogIcon,
  BellIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  ShieldCheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface UserSettings {
  notifications: {
    email: boolean;
    telegram: boolean;
    keywordMatches: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'fa' | 'en';
    timezone: string;
    dateFormat: string;
    numberFormat: 'persian' | 'english';
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    activityTracking: boolean;
    dataCollection: boolean;
  };
  account: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
}

export default function Settings() {
  const { t } = useTranslation('common');
  const { user, loading: authLoading } = useAuth();
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto';
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const response = await axios.get('/api/user/settings');
      return response.data;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<UserSettings>) =>
      axios.put('/api/user/settings', newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => axios.delete('/api/user/account'),
    onSuccess: () => {
      router.push('/login');
    },
  });

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(newTheme);
    }

    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };

    updateSettingsMutation.mutate(newSettings);
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('confirmDeleteAccount'))) {
      deleteAccountMutation.mutate();
    }
  };

  const tabs = [
    { id: 'general', name: t('general'), icon: CogIcon },
    { id: 'notifications', name: t('notifications'), icon: BellIcon },
    { id: 'privacy', name: t('privacy'), icon: ShieldCheckIcon },
    { id: 'account', name: t('account'), icon: UserIcon },
  ];

  if (authLoading || !user || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('settings')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('manageYourAccountSettings')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="card">
              <div className="card-body">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">{t('generalSettings')}</h3>

                    {/* Language Settings */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('language')}
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setLanguage('fa')}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            language === 'fa'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          🇮🇷 فارسی
                        </button>
                        <button
                          onClick={() => setLanguage('en')}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            language === 'en'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          🇺🇸 English
                        </button>
                      </div>
                    </div>

                    {/* Theme Settings */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('theme')}
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => applyTheme('light')}
                          className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                            theme === 'light'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <SunIcon className="w-4 h-4 mr-2" />
                          {t('light')}
                        </button>
                        <button
                          onClick={() => applyTheme('dark')}
                          className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                            theme === 'dark'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <MoonIcon className="w-4 h-4 mr-2" />
                          {t('dark')}
                        </button>
                        <button
                          onClick={() => applyTheme('auto')}
                          className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                            theme === 'auto'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <GlobeAltIcon className="w-4 h-4 mr-2" />
                          {t('auto')}
                        </button>
                      </div>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('timezone')}
                      </label>
                      <select
                        className="input-field"
                        value={settings?.preferences?.timezone || 'Asia/Tehran'}
                        onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                      >
                        <option value="Asia/Tehran">Tehran (GMT+3:30)</option>
                        <option value="America/New_York">New York (GMT-5)</option>
                        <option value="Europe/London">London (GMT+0)</option>
                        <option value="Asia/Dubai">Dubai (GMT+4)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">{t('notificationSettings')}</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('emailNotifications')}</h4>
                          <p className="text-sm text-gray-500">{t('receiveNotificationsByEmail')}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings?.notifications?.email || false}
                            onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('telegramNotifications')}</h4>
                          <p className="text-sm text-gray-500">{t('receiveNotificationsByTelegram')}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings?.notifications?.telegram || false}
                            onChange={(e) => handleSettingChange('notifications', 'telegram', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('keywordMatchAlerts')}</h4>
                          <p className="text-sm text-gray-500">{t('notifyWhenKeywordsMatch')}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings?.notifications?.keywordMatches || false}
                            onChange={(e) => handleSettingChange('notifications', 'keywordMatches', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">{t('privacySettings')}</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('profileVisibility')}</h4>
                          <p className="text-sm text-gray-500">{t('controlWhoCanSeeProfile')}</p>
                        </div>
                        <select
                          className="input-field w-32"
                          value={settings?.privacy?.profileVisibility || 'private'}
                          onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                        >
                          <option value="public">{t('public')}</option>
                          <option value="private">{t('private')}</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('activityTracking')}</h4>
                          <p className="text-sm text-gray-500">{t('allowActivityTracking')}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings?.privacy?.activityTracking || false}
                            onChange={(e) => handleSettingChange('privacy', 'activityTracking', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">{t('accountSettings')}</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('twoFactorAuthentication')}</h4>
                          <p className="text-sm text-gray-500">{t('addExtraSecurityToAccount')}</p>
                        </div>
                        <button className="btn-secondary">
                          {settings?.account?.twoFactorEnabled ? t('disable') : t('enable')}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('loginAlerts')}</h4>
                          <p className="text-sm text-gray-500">{t('notifyOnNewLogins')}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings?.account?.loginAlerts || false}
                            onChange={(e) => handleSettingChange('account', 'loginAlerts', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="border-t pt-6">
                        <h4 className="font-medium text-red-600 mb-2">{t('dangerZone')}</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          {t('deleteAccountWarning')}
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="btn-danger flex items-center"
                          disabled={deleteAccountMutation.isPending}
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          {deleteAccountMutation.isPending ? t('deleting') : t('deleteAccount')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fa', ['common'])),
  },
});