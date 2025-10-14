import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function WebApp() {
  const router = useRouter();
  const { loginWithTelegram, isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState<'telegram' | 'browser'>('browser');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      try {
        // @ts-ignore
        const tg = typeof window !== 'undefined' ? window?.Telegram?.WebApp : null;
        if (!tg || !tg.initData) {
          // Not inside Telegram – fallback: go to dashboard directly
          setMode('browser');
          router.replace('/dashboard');
          return;
        }

        setMode('telegram');
        tg.ready();
        tg.expand();

        const initData = tg.initData as string;
        const ok = await loginWithTelegram(initData);
        if (ok) {
          router.replace('/dashboard');
        } else {
          setError('Authentication failed');
          router.replace('/login');
        }
      } catch (e: any) {
        console.error('WebApp bootstrap failed', e);
        setError(e?.message || 'Initialization error');
        router.replace('/login');
      }
    };

    // If already authenticated, go to dashboard
    if (isAuthenticated) {
      router.replace('/dashboard');
      return;
    }

    boot();
  }, [router, isAuthenticated, loginWithTelegram]);

  return (
    <>
      <Head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-700 p-6">
        <div className="card p-6 w-full max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Initializing WebApp…</h1>
          <p className="text-sm text-gray-600 mb-4">
            {mode === 'telegram' ? 'Connecting to Telegram…' : 'Opening dashboard…'}
          </p>
          {loading && <div className="text-sm">Please wait…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </>
  );
}
