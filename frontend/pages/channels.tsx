import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import { withAuth } from '../lib/withAuth';

interface Channel {
  _id: string;
  platform: 'telegram' | 'eitaa' | 'website';
  channelUrl: string;
  channelName?: string;
  isActive: boolean;
  createdAt: string;
}

function Channels() {
  const { t } = useTranslation('common');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newChannelPlatform, setNewChannelPlatform] = useState<'telegram' | 'eitaa' | 'website'>('telegram');
  const [newChannelName, setNewChannelName] = useState('');
  const [error, setError] = useState('');

  // Fetch channels
  const { data: channels, isLoading: channelsLoading, error: channelsError } = useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get('/api/channels');
      return response.data;
    },
  });

  // Add channel mutation
  const addChannelMutation = useMutation({
    mutationFn: (channelData: { channelUrl: string; platform: 'telegram' | 'eitaa' | 'website'; channelName?: string }) =>
      api.post('/api/channels', channelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setNewChannelUrl('');
      setNewChannelName('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || t('failedToAddChannel'));
    },
  });

  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/channels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || t('failedToDeleteChannel'));
    },
  });

  if (authLoading) return <Layout><div>{t('loading')}</div></Layout>;
  if (channelsLoading) return <Layout><div>{t('loadingChannels')}</div></Layout>;
  if (channelsError) return <Layout><div>{t('errorLoadingChannels')}{(channelsError as Error).message}</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('channelManager')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('manageChannelsHelp')}</p>
        </div>

        {/* Add Channel Form */}
        <form onSubmit={(e) => { e.preventDefault(); if (newChannelUrl.trim()) { addChannelMutation.mutate({ channelUrl: newChannelUrl.trim(), platform: newChannelPlatform, channelName: newChannelName.trim() || undefined }); } }} className="mb-8 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('addNewChannel')}</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="channelUrl" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {t('channelUrl')}
              </label>
              <input
                type="text"
                id="channelUrl"
                value={newChannelUrl}
                onChange={(e) => setNewChannelUrl(e.target.value)}
                placeholder={t('channelUrlPlaceholder')}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label htmlFor="channelPlatform" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {t('platform')}
              </label>
              <select
                id="channelPlatform"
                value={newChannelPlatform}
                onChange={(e) => setNewChannelPlatform(e.target.value as 'telegram' | 'eitaa' | 'website')}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="telegram">{t('telegram')}</option>
                <option value="eitaa">{t('eitaa')}</option>
                <option value="website">{t('website')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="channelName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {t('channelNameOptional')}
              </label>
              <input
                type="text"
                id="channelName"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder={t('channelNamePlaceholder')}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={addChannelMutation.isPending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {addChannelMutation.isPending ? t('adding') : t('addChannel')}
          </button>
        </form>

        {/* Channels List */}
        <div className="grid gap-4">
          {channels?.map((channel) => (
            <div key={channel._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">{channel.channelName || channel.channelUrl}</span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('platform')}: {t(channel.platform)} • {t('active')}: {channel.isActive ? t('yes') : t('no')}
                </div>
              </div>
              <button
                onClick={() => deleteChannelMutation.mutate(channel._id)}
                disabled={deleteChannelMutation.isPending}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
              >
                {deleteChannelMutation.isPending ? t('deleting') : t('delete')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(Channels);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fa', ['common'])),
  },
});
