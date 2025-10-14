import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';

interface Destination {
  _id: string;
  type: 'private_chat' | 'group' | 'channel';
  platform: 'telegram' | 'eitaa';
  chatId: string;
  name: string;
  isActive: boolean;
}

export default function Destinations() {
  const { t } = useTranslation('common');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [newDestinationName, setNewDestinationName] = useState('');
  const [newDestinationType, setNewDestinationType] = useState<'private_chat' | 'group' | 'channel'>('private_chat');
  const [newDestinationPlatform, setNewDestinationPlatform] = useState<'telegram' | 'eitaa'>('telegram');
  const [newDestinationChatId, setNewDestinationChatId] = useState('');
  const [error, setError] = useState('');

  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  const { data: destinations, isLoading: destinationsLoading, error: destinationsError } = useQuery<Destination[]>({
    queryKey: ['destinations'],
    queryFn: async () => {
      const response = await axios.get('/api/destinations');
      return response.data;
    },
    enabled: !!user,
  });

  const addDestinationMutation = useMutation({
    mutationFn: (destinationData: { name: string; type: string; platform: string; chatId: string; }) =>
      axios.post('/api/destinations', destinationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      setNewDestinationName('');
      setNewDestinationChatId('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || t('failedToAddDestination'));
    },
  });

  const deleteDestinationMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/destinations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || t('failedToDeleteDestination'));
    },
  });

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDestinationName.trim() && newDestinationChatId.trim()) {
      addDestinationMutation.mutate({
        name: newDestinationName.trim(),
        type: newDestinationType,
        platform: newDestinationPlatform,
        chatId: newDestinationChatId.trim(),
      });
    }
  };

  if (authLoading || !user) return <Layout><div>{t('loading')}</div></Layout>;
  if (destinationsLoading) return <Layout><div>{t('loadingDestinations')}</div></Layout>;
  if (destinationsError) return <Layout><div>{t('errorLoadingDestinations')}{(destinationsError as Error).message}</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('destinationManager')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('manageDestinationsHelp')}</p>
        </div>

        <form onSubmit={handleAddDestination} className="mb-8 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('addNewDestination')}</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="destinationName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {t('destinationName')}
              </label>
              <input
                type="text"
                id="destinationName"
                value={newDestinationName}
                onChange={(e) => setNewDestinationName(e.target.value)}
                placeholder={t('destinationNamePlaceholder')}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label htmlFor="destinationChatId" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {t('chatId')}
              </label>
              <input
                type="text"
                id="destinationChatId"
                value={newDestinationChatId}
                onChange={(e) => setNewDestinationChatId(e.target.value)}
                placeholder={t('chatIdPlaceholder')}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label htmlFor="destinationPlatform" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {t('platform')}
              </label>
              <select
                id="destinationPlatform"
                value={newDestinationPlatform}
                onChange={(e) => setNewDestinationPlatform(e.target.value as 'telegram' | 'eitaa')}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="telegram">{t('telegram')}</option>
                <option value="eitaa">{t('eitaa')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="destinationType" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                {t('type')}
              </label>
              <select
                id="destinationType"
                value={newDestinationType}
                onChange={(e) => setNewDestinationType(e.target.value as 'private_chat' | 'group' | 'channel')}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="private_chat">{t('privateChat')}</option>
                <option value="group">{t('group')}</option>
                <option value="channel">{t('channel')}</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={addDestinationMutation.isPending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {addDestinationMutation.isPending ? t('adding') : t('addDestination')}
          </button>
        </form>

        <div className="grid gap-4">
          {destinations?.map((destination) => (
            <div key={destination._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">{destination.name}</span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t(destination.platform)} - {t(destination.type)} ({destination.chatId})
                </div>
              </div>
              <button
                onClick={() => deleteDestinationMutation.mutate(destination._id)}
                disabled={deleteDestinationMutation.isPending}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
              >
                {deleteDestinationMutation.isPending ? t('deleting') : t('delete')}
              </button>
            </div>
          ))}
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