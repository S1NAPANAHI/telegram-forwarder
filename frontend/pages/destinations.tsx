import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

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

  if (authLoading || !user) return <div>{t('loading')}</div>;
  if (destinationsLoading) return <div>{t('loadingDestinations')}</div>;
  if (destinationsError) return <div>{t('errorLoadingDestinations')}{(destinationsError as Error).message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('destinationManager')}</h1>

      <form onSubmit={handleAddDestination} className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">{t('addNewDestination')}</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="destinationName" className="block text-gray-700 text-sm font-bold mb-2">
              {t('destinationName')}
            </label>
            <input
              type="text"
              id="destinationName"
              value={newDestinationName}
              onChange={(e) => setNewDestinationName(e.target.value)}
              placeholder={t('destinationNamePlaceholder')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="destinationChatId" className="block text-gray-700 text-sm font-bold mb-2">
              {t('chatId')}
            </label>
            <input
              type="text"
              id="destinationChatId"
              value={newDestinationChatId}
              onChange={(e) => setNewDestinationChatId(e.target.value)}
              placeholder={t('chatIdPlaceholder')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="destinationPlatform" className="block text-gray-700 text-sm font-bold mb-2">
              {t('platform')}
            </label>
            <select
              id="destinationPlatform"
              value={newDestinationPlatform}
              onChange={(e) => setNewDestinationPlatform(e.target.value as 'telegram' | 'eitaa')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="telegram">{t('telegram')}</option>
              <option value="eitaa">{t('eitaa')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="destinationType" className="block text-gray-700 text-sm font-bold mb-2">
              {t('type')}
            </label>
            <select
              id="destinationType"
              value={newDestinationType}
              onChange={(e) => setNewDestinationType(e.target.value as 'private_chat' | 'group' | 'channel')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {addDestinationMutation.isPending ? t('adding') : t('addDestination')}
        </button>
      </form>

      <div className="grid gap-4">
        {destinations?.map((destination) => (
          <div key={destination._id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center bg-white shadow-sm">
            <div>
              <span className="font-semibold">{destination.name}</span>
              <div className="text-sm text-gray-500">
                {t(destination.platform)} - {t(destination.type)} ({destination.chatId})
              </div>
            </div>
            <button
              onClick={() => deleteDestinationMutation.mutate(destination._id)}
              disabled={deleteDestinationMutation.isPending}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {deleteDestinationMutation.isPending ? t('deleting') : t('delete')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});
