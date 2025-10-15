import { useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';

// Telegram WebApp handshake page
export default function WebApp() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // Read initData from Telegram WebApp if available
        const w = window as any;
        const initData: string | undefined = w?.Telegram?.WebApp?.initData;
        const next = typeof router.query.next === 'string' ? router.query.next : '/dashboard';
        
        if (!initData) {
          // Try header-based auth if Telegram injected header via proxy, otherwise fallback
          router.replace('/login?next=' + encodeURIComponent(next));
          return;
        }
        
        const res = await api.post('/api/auth/telegram-webapp', { initData });
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          router.replace(next);
          return;
        }
        router.replace('/login?next=' + encodeURIComponent(next));
      } catch (e) {
        router.replace('/login');
      }
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-8 h-8" />
    </div>
  );
}
