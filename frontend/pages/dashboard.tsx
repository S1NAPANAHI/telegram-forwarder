import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InformationCircleIcon, ChartBarIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';


const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

interface Keyword {
  _id: string;
  keyword: string;
  isActive: boolean;
  caseSensitive: boolean;
  exactMatch: boolean;
  createdAt: string;
}

interface Log {
    _id: string;
    message: string;
    timestamp: string;
    keywordId: { keyword: string };
    channelId: { channelName: string };
}

interface Channel {
    _id: string;
    channelName: string;
    isActive: boolean;
}

// Stat Card component
const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="mr-4">{icon}</div>
        <div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export default function Dashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;
  const { user } = useAuth();

  const [newKeyword, setNewKeyword] = useState('');
  const queryClient = useQueryClient();

  const changeLanguage = (lng: string) => {
    router.push(router.pathname, router.asPath, { locale: lng });
  };

  const linkTelegramAccount = async () => {
    try {
      // This will open Telegram with a deep link to start the bot
      const botUsername = 'your_bot_username'; // Replace with your actual bot username
      if (!user?._id) {
        console.error('User ID not available for Telegram linking.');
        return;
      }
      const telegramUrl = `https://t.me/${botUsername}?start=link_${user._id}`;
      window.open(telegramUrl, '_blank');
    } catch (error) {
      console.error('Error linking Telegram:', error);
    }
  };

  // Fetch keywords
  const { data: keywords, isLoading: isLoadingKeywords } = useQuery<Keyword[]>({
    queryKey: ['keywords'],
    queryFn: async () => {
      const response = await apiClient.get('/api/keywords');
      return response.data;
    },
  });

  // Fetch logs
  const { data: logs, isLoading: isLoadingLogs } = useQuery<Log[]>({
    queryKey: ['logs'],
    queryFn: async () => {
        const response = await apiClient.get('/api/logs');
        return response.data;
    }
  });

  // Fetch channels
  const { data: channels, isLoading: isLoadingChannels } = useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: async () => {
        const response = await apiClient.get('/api/channels');
        return response.data;
    }
  });

  const addKeywordMutation = useMutation({
    mutationFn: (keyword: string) => apiClient.post('/api/keywords', { keyword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      setNewKeyword('');
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/keywords/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      addKeywordMutation.mutate(newKeyword.trim());
    }
  };

  const { forwardedToday, chartData } = useMemo(() => {
    if (!logs) return { forwardedToday: 0, chartData: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const forwardedToday = logs.filter(log => new Date(log.timestamp) >= today).length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => ({
        date,
        count: logs.filter(log => log.timestamp.startsWith(date)).length,
    }));

    return { forwardedToday, chartData };
  }, [logs]);

  const activeChannels = useMemo(() => {
      if(!channels) return 0;
      return channels.filter(c => c.isActive).length;
  }, [channels]);


  const isLoading = isLoadingKeywords || isLoadingLogs || isLoadingChannels;

  if (isLoading) return <div>{t('loadingKeywords')}</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
                <div>
                    <button onClick={() => changeLanguage('en')} disabled={locale === 'en'} className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 mr-2">English</button>
                    <button onClick={() => changeLanguage('fa')} disabled={locale === 'fa'} className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50">فارسی</button>
                    {user && (
                      <button onClick={linkTelegramAccount} className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Link Telegram
                      </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title={t('messagesForwardedToday')} value={forwardedToday} icon={<ChartBarIcon className='h-8 w-8 text-blue-500'/>} />
                <StatCard title={t('totalKeywords')} value={keywords?.length ?? 0} icon={<KeyIcon className='h-8 w-8 text-green-500'/>} />
                <StatCard title={t('activeChannels')} value={activeChannels} icon={<InformationCircleIcon className='h-8 w-8 text-indigo-500'/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2">
                    {/* Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-bold mb-4">{t('forwardingActivityLast7Days')}</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name={t('forwardedMessages')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Keyword Manager */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">{t('keywordManager')}</h2>
                        <form onSubmit={handleAddKeyword} className="mb-8">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    placeholder={t('enterKeyword')}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={addKeywordMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {addKeywordMutation.isPending ? t('adding') : t('addKeyword')}
                                </button>
                            </div>
                            {addKeywordMutation.isError && (
                            <p className="text-red-500 mt-2">{t('errorAddingKeyword')}{(addKeywordMutation.error as Error).message}</p>
                            )}
                        </form>

                        <div className="grid gap-4">
                            {keywords?.map((keyword: Keyword) => (
                            <div key={keyword._id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                                <div>
                                <span className="font-semibold">{keyword.keyword}</span>
                                <div className="text-sm text-gray-500">
                                    {keyword.caseSensitive && `${t('caseSensitive')} • `}
                                    {keyword.exactMatch && `${t('exactMatch')} • `}
                                    {t('added')} {new Date(keyword.createdAt).toLocaleDateString()}
                                </div>
                                </div>
                                <button
                                onClick={() => deleteKeywordMutation.mutate(keyword._id)}
                                disabled={deleteKeywordMutation.isPending}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                {deleteKeywordMutation.isPending ? t('deleting') : t('delete')}
                                </button>
                            </div>
                            ))}
                        </div>
                        {deleteKeywordMutation.isError && (
                            <p className="text-red-500 mt-2">{t('errorDeletingKeyword')}{(deleteKeywordMutation.error as Error).message}</p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">{t('recentActivity')}</h2>
                    <ul className="space-y-4">
                        {logs?.slice(0, 10).map(log => (
                            <li key={log._id} className="flex items-start">
                                <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-1"/>
                                <div>
                                    <p className="font-semibold">{log.keywordId.keyword}</p>
                                    <p className="text-sm text-gray-600 truncate">{log.message}</p>
                                    <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  console.log('Dashboard getStaticProps: Received locale', locale);
  const translations = await serverSideTranslations(locale ?? 'en', ['common']); // Pass the i18n config
  console.log('Dashboard getStaticProps: Loaded translations for locale', locale ?? 'en', translations);
  return {
    props: {
      ...translations,
    },
  };
};
