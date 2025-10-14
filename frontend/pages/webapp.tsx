import { useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function WebApp() {
  const router = useRouter();

  useEffect(() => {
    const boot = async () => {
      try {
        // @ts-ignore
        const tg = window?.Telegram?.WebApp;
        if (!tg || !tg.initData) {
          // Not inside Telegram – fallback: go to login or dashboard
          router.replace('/dashboard');
          return;
        }
        tg.ready();
        tg.expand();

        const initData = tg.initData as string;
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram-webapp/session`, { initData });
        // If you later return a JWT, store it in localStorage/cookie and add to axios headers
        router.replace('/dashboard');
      } catch (e) {
        console.error('WebApp bootstrap failed', e);
        router.replace('/login');
      }
    };
    boot();
  }, [router]);

  return (
    <>
      <Head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </Head>
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Initializing...
      </div>
    </>
  );
}
