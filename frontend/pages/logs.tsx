import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

interface Log {
  _id: string;
  message: string;
  status: 'success' | 'failed' | 'pending' | 'duplicate';
  timestamp: string;
  matchedText: string;
}

export default function Logs() {
  const { t } = useTranslation('common');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  const { data: logs, isLoading, error } = useQuery<Log[]>({ 
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await axios.get('/api/logs');
      return response.data;
    },
    enabled: !!user,
  });

  if (authLoading || !user) return <div>{t('loading')}</div>;
  if (isLoading) return <div>{t('loadingLogs')}</div>;
  if (error) return <div>{t('errorLoadingLogs')}{(error as Error).message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('logs')}</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('message')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('timestamp')}
              </th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{log.message}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${log.status === 'success' ? 'bg-green-200' : log.status === 'failed' ? 'bg-red-200' : 'bg-yellow-200'} opacity-50 rounded-full`}
                    ></span>
                    <span className="relative">{t(log.status)}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});
