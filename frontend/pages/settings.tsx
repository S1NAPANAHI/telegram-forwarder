import RouteGuard from '../components/auth/RouteGuard';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import {
  KeyIcon,
  LockClosedIcon,
  BellIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface ProfileResponse {
  id: string;
  email: string;
  username?: string | null;
  telegramId?: string | null;
  role: string;
}

interface BotSettings {
  language: 'en' | 'fa';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    telegram: boolean;
    desktop: boolean;
  };
  privacy: {
    anonymizeLogs: boolean;
    redactUsernames: boolean;
  };
  performance: {
    realtimeUpdates: boolean;
    animations: boolean;
  };
}

const defaultSettings: BotSettings = {
  language: 'en',
  theme: 'system',
  notifications: { email: true, telegram: true, desktop: false },
  privacy: { anonymizeLogs: false, redactUsernames: false },
  performance: { realtimeUpdates: true, animations: true },
};

function Settings() {
  const { t } = useTranslation('common');
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [settings, setSettings] = useState<BotSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [me, cfg] = await Promise.all([
        api.get('/api/auth/me'),
        api.get('/api/settings').catch(() => ({ data: defaultSettings }))
      ]);
      setProfile(me.data);
      setSettings({ ...defaultSettings, ...(cfg.data || {}) });
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.put('/api/settings', settings);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (path: string) => {
    setSettings(prev => {
      const clone: any = { ...prev };
      const parts = path.split('.');
      let ref: any = clone;
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
      const last = parts[parts.length - 1];
      ref[last] = !ref[last];
      return clone as BotSettings;
    });
  };

  return (
    <RouteGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('configureYourBotSettings')}</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {savedAt && <>Last saved at {savedAt}</>}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* General */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2"/> General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Language</label>
                <select
                  value={settings.language}
                  onChange={e => setSettings(s => ({ ...s, language: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="fa">Persian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Theme</label>
                <select
                  value={settings.theme}
                  onChange={e => setSettings(s => ({ ...s, theme: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BellIcon className="w-5 h-5 mr-2"/> Notifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={settings.notifications.email} onChange={() => toggle('notifications.email')} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                Email alerts
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={settings.notifications.telegram} onChange={() => toggle('notifications.telegram')} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                Telegram DM
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={settings.notifications.desktop} onChange={() => toggle('notifications.desktop')} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                Desktop notifications
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2"/> Privacy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={settings.privacy.anonymizeLogs} onChange={() => toggle('privacy.anonymizeLogs')} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                Anonymize logs (hide personal identifiers)
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={settings.privacy.redactUsernames} onChange={() => toggle('privacy.redactUsernames')} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                Redact usernames in UI
              </label>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BoltIcon className="w-5 h-5 mr-2"/> Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={settings.performance.realtimeUpdates} onChange={() => toggle('performance.realtimeUpdates')} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                Real-time updates (websocket)
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={settings.performance.animations} onChange={() => toggle('performance.animations')} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                Enable animations
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </Layout>
    </RouteGuard>
  );
}

export default Settings;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fa', ['common'])),
  },
});