import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { appWithTranslation } from 'next-i18next';
import i18nextConfig from '../next-i18next.config';
import axios from 'axios';

if (process.env.NEXT_PUBLIC_API_URL) {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
}

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Component {...pageProps} />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp, i18nextConfig);
