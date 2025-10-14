import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider
import '../styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import axios from 'axios';

// Set the base URL for all axios requests
if (process.env.NEXT_PUBLIC_API_URL) {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
}

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* Wrap with AuthProvider */}
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp);