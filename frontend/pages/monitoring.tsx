import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import i18nextConfig from '../next-i18next.config';

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

  if (authLoading || !user) return <div>{t('loading')}</div>;
  if (isLoading) return <div>{t('loadingMonitoringStatus')}</div>;
  if (error) return <div>{t('errorLoadingMonitoringStatus')}{(error as Error).message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('monitoringControl')}</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('channelId')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {channels?.map((channel) => (
              <tr key={channel.channelId}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{channel.channelId}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${channel.status === 'active' ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}
                    ></span>
                    <span className="relative">{t(channel.status)}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button 
                    onClick={() => startMutation.mutate(channel.channelId)} 
                    disabled={channel.status === 'active' || startMutation.isPending}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 disabled:opacity-50"
                  >
                    {t('start')}
                  </button>
                  <button 
                    onClick={() => stopMutation.mutate(channel.channelId)} 
                    disabled={channel.status !== 'active' || stopMutation.isPending}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                  >
                    {t('stop')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = locale || 'fa';
  return {
    props: {
      ...(await serverSideTranslations(lng, ['common'], i18nextConfig)),
    },
  };
};