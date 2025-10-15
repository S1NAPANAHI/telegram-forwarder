import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import Layout from '../components/Layout';

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
}

export default function Debug() {
  const { user, loading } = useAuth();
  const [telegramData, setTelegramData] = useState<TelegramWebApp | null>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAuthenticated = Boolean(user);
  const isTelegramUser = Boolean(user?.telegramId);

  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    if (tg) {
      setIsTelegramWebApp(true);
      setTelegramData(tg);
    }

    setSystemInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenSize: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
    });
  }, []);

  const envVars = { 'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL };

  const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, type = 'text' }: { label: string; value: any; type?: 'text' | 'json' | 'boolean' }) => {
    let displayValue;
    let valueClass = 'text-gray-900 dark:text-white';
    
    if (type === 'boolean') {
      displayValue = value ? '✅ Yes' : '❌ No';
      valueClass = value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    } else if (type === 'json') {
      displayValue = (
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    } else {
      displayValue = String(value || 'Not set');
      if (!value) valueClass = 'text-gray-500 dark:text-gray-400';
    }

    return (
      <div className="mb-3 last:mb-0">
        <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</dt>
        <dd className={`text-sm ${valueClass}`}>
          {displayValue}
        </dd>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Debug Information - Telegram Bot</title>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </Head>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔍 Debug Information</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">System configuration and Telegram WebApp detection</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoSection title="📱 Telegram WebApp Detection">
              <dl className="space-y-3">
                <InfoRow label="Running in Telegram WebApp" value={isTelegramWebApp} type="boolean" />
                <InfoRow label="Init Data Available" value={Boolean(telegramData?.initData)} type="boolean" />
                <InfoRow label="WebApp Version" value={telegramData?.version} />
                <InfoRow label="Platform" value={telegramData?.platform} />
                <InfoRow label="Color Scheme" value={telegramData?.colorScheme} />
                <InfoRow label="Is Expanded" value={telegramData?.isExpanded} type="boolean" />
                {telegramData?.user && <InfoRow label="Telegram User Data" value={telegramData.user} type="json" />}
              </dl>
            </InfoSection>

            <InfoSection title="🔐 Authentication Status">
              <dl className="space-y-3">
                <InfoRow label="Authenticated" value={isAuthenticated} type="boolean" />
                <InfoRow label="Telegram User" value={isTelegramUser} type="boolean" />
                <InfoRow label="Loading" value={loading} type="boolean" />
                <InfoRow label="Has JWT Token" value={Boolean(token)} type="boolean" />
                {token && <InfoRow label="Token Preview" value={`${token.substring(0, 20)}...`} />}
                {user && (
                  <>
                    <InfoRow label="Username" value={user.username} />
                    <InfoRow label="Email" value={user.email} />
                    {user.telegramId && <InfoRow label="Telegram ID" value={user.telegramId} />}
                  </>
                )}
              </dl>
            </InfoSection>

            <InfoSection title="⚙️ Environment Configuration">
              <dl className="space-y-3">
                {Object.entries(envVars).map(([key, value]) => (
                  <InfoRow key={key} label={key} value={value} />
                ))}
              </dl>
            </InfoSection>

            <InfoSection title="💻 System Information">
              <dl className="space-y-3">
                {systemInfo && Object.entries(systemInfo).map(([key, value]) => (
                  <InfoRow 
                    key={key} 
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                    value={value} 
                    type={typeof value === 'boolean' ? 'boolean' : 'text'}
                  />
                ))}
              </dl>
            </InfoSection>
          </div>

          {user && (
            <InfoSection title="👤 Raw User Data">
              <InfoRow label="Complete User Object" value={user} type="json" />
            </InfoSection>
          )}

          {telegramData && (
            <InfoSection title="📋 Raw Telegram Data">
              <InfoRow 
                label="Complete Telegram WebApp Object" 
                value={{
                  initData: telegramData.initData ? `${telegramData.initData.substring(0, 100)}...` : null,
                  initDataUnsafe: telegramData.initDataUnsafe,
                  version: telegramData.version,
                  platform: telegramData.platform,
                  colorScheme: telegramData.colorScheme,
                  themeParams: telegramData.themeParams,
                  isExpanded: telegramData.isExpanded,
                  viewportHeight: telegramData.viewportHeight,
                  viewportStableHeight: telegramData.viewportStableHeight,
                }} 
                type="json" 
              />
            </InfoSection>
          )}

          <InfoSection title="🧪 Test Actions">
            <div className="space-y-3">
              <button onClick={() => window.location.reload()} className="btn-secondary mr-3">Reload Page</button>
              <button onClick={() => localStorage.clear()} className="btn-secondary mr-3">Clear localStorage</button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify({
                    user,
                    token: token ? `${token.substring(0, 20)}...` : null,
                    telegramData: telegramData ? {
                      ...telegramData,
                      initData: telegramData.initData ? `${telegramData.initData.substring(0, 50)}...` : null
                    } : null,
                    env: envVars
                  }, null, 2));
                }}
                className="btn-primary"
              >
                Copy Debug Info
              </button>
            </div>
          </InfoSection>
        </div>
      </Layout>
    </>
  );
}
