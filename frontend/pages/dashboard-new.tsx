import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ChartBarIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
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
  matchesToday?: number;
}

interface Log {
  _id: string;
  message: string;
  timestamp: string;
  keywordId: { keyword: string };
  channelId: { channelName: string };
  status: 'pending' | 'forwarded' | 'failed';
}

interface Channel {
  _id: string;
  channelName: string;
  isActive: boolean;
  platform: 'telegram' | 'eitaa';
  messagesToday?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user } = useAuth();
  const [newKeyword, setNewKeyword] = useState('');
  const [showKeywordForm, setShowKeywordForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch keywords
  const { data: keywords = [], isLoading: isLoadingKeywords } = useQuery<Keyword[]>({
    queryKey: ['keywords'],
    queryFn: async () => {
      const response = await apiClient.get('/api/keywords');
      return response.data;
    },
  });

  // Fetch logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery<Log[]>({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await apiClient.get('/api/logs');
      return response.data;
    },
  });

  // Fetch channels
  const { data: channels = [], isLoading: isLoadingChannels } = useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await apiClient.get('/api/channels');
      return response.data;
    },
  });

  const addKeywordMutation = useMutation({
    mutationFn: (keyword: string) => apiClient.post('/api/keywords', { keyword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      setNewKeyword('');
      setShowKeywordForm(false);
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/keywords/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const forwardedToday = logs.filter(log => 
      new Date(log.timestamp) >= today && log.status === 'forwarded'
    ).length;

    const activeChannels = channels.filter(c => c.isActive).length;
    const activeKeywords = keywords.filter(k => k.isActive).length;

    const successRate = logs.length > 0 
      ? (logs.filter(log => log.status === 'forwarded').length / logs.length * 100).toFixed(1)
      : '0';

    return {
      forwardedToday,
      activeChannels,
      activeKeywords,
      successRate,
    };
  }, [logs, channels, keywords]);

  // Chart data
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyStats = last7Days.map(date => {
      const dayLogs = logs.filter(log => log.timestamp.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
        forwarded: dayLogs.filter(log => log.status === 'forwarded').length,
        failed: dayLogs.filter(log => log.status === 'failed').length,
        total: dayLogs.length,
      };
    });

    return dailyStats;
  }, [logs]);

  // Keyword performance data
  const keywordPerformance = useMemo(() => {
    return keywords.slice(0, 5).map((keyword, index) => ({
      keyword: keyword.keyword,
      matches: Math.floor(Math.random() * 50) + 10,
      successRate: Math.floor(Math.random() * 20) + 80,
      color: COLORS[index % COLORS.length],
    }));
  }, [keywords]);

  // Recent activity data for table
  const recentActivity = logs.slice(0, 10).map(log => ({
    ...log,
    keyword: log.keywordId?.keyword || 'N/A',
    channel: log.channelId?.channelName || 'N/A',
    time: new Date(log.timestamp).toLocaleString(),
  }));

  const activityColumns = [
    {
      key: 'keyword',
      label: t('keyword'),
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'channel',
      label: t('channel'),
      sortable: true,
    },
    {
      key: 'status',
      label: t('status'),
      render: (value: string) => {
        const statusConfig = {
          forwarded: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: CheckCircleIcon },
          failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', icon: XCircleIcon },
          pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', icon: ClockIcon },
        };
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {t(value)}
          </span>
        );
      },
    },
    {
      key: 'time',
      label: t('timestamp'),
      sortable: true,
    },
  ];

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      addKeywordMutation.mutate(newKeyword.trim());
    }
  };

  const isLoading = isLoadingKeywords || isLoadingLogs || isLoadingChannels;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('welcomeBack')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowKeywordForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              {t('addKeyword')}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('messagesForwardedToday')}
            value={stats.forwardedToday}
            icon={<PaperAirplaneIcon className="h-6 w-6" />}
            change={{ value: '+12%', type: 'increase' }}
            loading={isLoading}
          />
          <StatCard
            title={t('totalKeywords')}
            value={stats.activeKeywords}
            icon={<KeyIcon className="h-6 w-6" />}
            loading={isLoading}
          />
          <StatCard
            title={t('activeChannels')}
            value={stats.activeChannels}
            icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
            loading={isLoading}
          />
          <StatCard
            title={t('successRate')}
            value={`${stats.successRate}%`}
            icon={<ChartBarIcon className="h-6 w-6" />}
            change={{ value: '+2.1%', type: 'increase' }}
            loading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('forwardingActivityLast7Days')}
              </h3>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                {t('viewDetails')}
              </button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-gray-600 dark:text-gray-400" 
                  />
                  <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="forwarded" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name={t('forwardedMessages')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="failed" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name={t('failed')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Keyword Performance */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('topKeywords')}
              </h3>
            </div>
            <div className="space-y-4">
              {keywordPerformance.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.keyword}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.matches} {t('matches')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.successRate}% {t('success')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('recentActivity')}
            </h3>
            <button 
              onClick={() => router.push('/logs')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
            >
              {t('viewAllLogs')}
            </button>
          </div>
          
          <DataTable
            columns={activityColumns}
            data={recentActivity}
            loading={isLoading}
            searchable={true}
            pagination={false}
          />
        </div>

        {/* Quick Add Keyword Modal */}
        {showKeywordForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('addNewKeyword')}
                </h3>
                <button
                  onClick={() => setShowKeywordForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddKeyword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('keyword')}
                  </label>
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder={t('enterKeyword')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowKeywordForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={addKeywordMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {addKeywordMutation.isPending ? t('adding') : t('addKeyword')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = locale || 'fa';
  return {
    props: {
      ...(await serverSideTranslations(lng, ['common'])),
    },
  };
};