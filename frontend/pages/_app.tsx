import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { appWithTranslation } from 'next-i18next';
import axios from 'axios';
import { useEffect } from 'react';

if (process.env.NEXT_PUBLIC_API_URL) {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
}

const queryClient = new QueryClient();

function MyApp({ Component, pageProps, router }: AppProps) {
  // Apply persisted language + RTL on load
  useEffect(() => {
    const lng = router.locale || localStorage.getItem('ui_language') || 'fa';
    if (lng === 'fa') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'fa';
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
      document.documentElement.classList.remove('rtl');
    }
  }, [router.locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp);
}