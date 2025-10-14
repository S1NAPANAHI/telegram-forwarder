import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';

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

  if (authLoading || !user) return <Layout><div>{t('loading')}</div></Layout>;
  if (isLoading) return <Layout><div>{t('loadingLogs')}</div></Layout>;
  if (error) return <Layout><div>{t('errorLoadingLogs')}{(error as Error).message}</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('logs')}</h1>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('message')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('timestamp')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs?.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'success' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : log.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    }`}>
                      {t(log.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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