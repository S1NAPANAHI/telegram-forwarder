import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';

interface MonitoredChannel {
  channelId: string;
  status: 'active' | 'inactive';
}

export default function Monitoring() {
  const { t } = useTranslation('common');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  const { data: channels, isLoading, error } = useQuery<MonitoredChannel[]>({ 
    queryKey: ['monitoringStatus'],
    queryFn: async () => {
      const response = await axios.get('/api/monitoring/status');
      return response.data;
    },
    enabled: !!user,
  });

  const startMutation = useMutation({
    mutationFn: (channelId: string) => axios.post(`/api/monitoring/start/${channelId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoringStatus'] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: (channelId: string) => axios.post(`/api/monitoring/stop/${channelId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoringStatus'] });
    },
  });

  if (authLoading || !user) return <Layout><div>{t('loading')}</div></Layout>;
  if (isLoading) return <Layout><div>{t('loadingMonitoringStatus')}</div></Layout>;
  if (error) return <Layout><div>{t('errorLoadingMonitoringStatus')}{(error as Error).message}</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('monitoringControl')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('controlChannelMonitoring')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('channelId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {channels?.map((channel) => (
                <tr key={channel.channelId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {channel.channelId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      channel.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {t(channel.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => startMutation.mutate(channel.channelId)} 
                      disabled={channel.status === 'active' || startMutation.isPending}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('start')}
                    </button>
                    <button 
                      onClick={() => stopMutation.mutate(channel.channelId)} 
                      disabled={channel.status !== 'active' || stopMutation.isPending}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('stop')}
                    </button>
                  </td>
                </tr>
              ))}
              {!channels?.length && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('noChannelsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = locale || 'fa';
  return {
    props: {
      ...(await serverSideTranslations(lng, ['common'])),
    },
  };
};