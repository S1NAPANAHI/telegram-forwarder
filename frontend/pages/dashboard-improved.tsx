import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
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
  UserGroupIcon,
  BellIcon,
  ArrowUpRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { StatsCard } from '../components/enhanced/StatsCard';
import { ModernCard } from '../components/enhanced/ModernCard';
import { ModernButton } from '../components/enhanced/ModernButton';
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

interface ActivityItem {
  id: string;
  type: 'forward' | 'channel_added' | 'user_joined' | 'keyword_match';
  message: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const COLORS = ['#24A1DE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

  // Recent activity data
  const recentActivity: ActivityItem[] = useMemo(() => {
    const activities = logs.slice(0, 8).map(log => ({
      id: log._id,
      type: log.status === 'forwarded' ? 'forward' as const : 'keyword_match' as const,
      message: log.status === 'forwarded' 
        ? `Message forwarded from ${log.channelId?.channelName || 'Unknown'} with keyword "${log.keywordId?.keyword || 'N/A'}"`
        : `Keyword match detected: "${log.keywordId?.keyword || 'N/A'}"`,
      timestamp: new Date(log.timestamp).toLocaleString(),
      icon: log.status === 'forwarded' ? PaperAirplaneIcon : KeyIcon,
      color: log.status === 'forwarded' ? 'telegram' : 'purple'
    }));

    // Add some sample activities for better demo
    const sampleActivities: ActivityItem[] = [
      {
        id: 'sample-1',
        type: 'channel_added',
        message: 'New channel added: Tech News',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(),
        icon: ChatBubbleLeftRightIcon,
        color: 'green'
      },
      {
        id: 'sample-2',
        type: 'user_joined',
        message: 'New user registered: johndoe@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toLocaleString(),
        icon: UserGroupIcon,
        color: 'blue'
      }
    ];

    return [...activities, ...sampleActivities].slice(0, 10);
  }, [logs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      addKeywordMutation.mutate(newKeyword.trim());
    }
  };

  const isLoading = isLoadingKeywords || isLoadingLogs || isLoadingChannels;

  return (
    <Layout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dashboard') || 'Dashboard'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('welcomeBackHereIsOverview') || `Welcome back, ${user?.username || 'User'}! Here's your bot overview.`}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <ModernButton
              variant="ghost"
              icon={<EyeIcon className="w-4 h-4" />}
              onClick={() => router.push('/analytics')}
            >
              {t('analytics') || 'Analytics'}
            </ModernButton>
            <ModernButton
              variant="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => setShowKeywordForm(true)}
            >
              {t('addKeyword') || 'Add Keyword'}
            </ModernButton>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title={t('messagesForwardedToday') || 'Messages Today'}
            value={isLoading ? '---' : stats.forwardedToday.toLocaleString()}
            change={{
              value: '+12%',
              type: 'increase'
            }}
            icon={<PaperAirplaneIcon className="w-6 h-6" />}
            color="blue"
            loading={isLoading}
          />
          
          <StatsCard
            title={t('activeChannels') || 'Active Channels'}
            value={isLoading ? '---' : stats.activeChannels}
            change={{
              value: '+5%',
              type: 'increase'
            }}
            icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
            color="green"
            loading={isLoading}
          />
          
          <StatsCard
            title={t('totalKeywords') || 'Active Keywords'}
            value={isLoading ? '---' : stats.activeKeywords}
            change={{
              value: '+8%',
              type: 'increase'
            }}
            icon={<KeyIcon className="w-6 h-6" />}
            color="purple"
            loading={isLoading}
          />
          
          <StatsCard
            title={t('successRate') || 'Success Rate'}
            value={isLoading ? '---' : `${stats.successRate}%`}
            change={{
              value: '+2%',
              type: 'increase'
            }}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="yellow"
            loading={isLoading}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Activity Chart */}
            <ModernCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('forwardingActivityLast7Days') || 'Activity Last 7 Days'}
                </h2>
                <ModernButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/analytics')}
                >
                  {t('viewDetails') || 'View Details'} 
                  <ArrowUpRightIcon className="w-4 h-4 ml-1" />
                </ModernButton>
              </div>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse flex space-x-4 w-full">
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
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
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px -4px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="forwarded" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name={t('forwardedMessages') || 'Forwarded'}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="failed" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name={t('failed') || 'Failed'}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ModernCard>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModernCard>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('channelPerformance') || 'Channel Performance'}
                </h3>
                <div className="space-y-4">
                  {channels.slice(0, 4).map((channel, index) => (
                    <div key={channel._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-${COLORS[index % COLORS.length]}`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {channel.channelName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.floor(Math.random() * 50) + 10} {t('messages') || 'messages'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {channel.isActive ? t('active') || 'Active' : t('inactive') || 'Inactive'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ModernCard>

              <ModernCard>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('keywordMatches') || 'Top Keywords'}
                </h3>
                <div className="space-y-4">
                  {keywords.slice(0, 4).map((keyword, index) => (
                    <div key={keyword._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {keyword.keyword}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.floor(Math.random() * 30) + 5} {t('matches') || 'matches'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.floor(Math.random() * 20) + 80}% {t('success') || 'success'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ModernCard>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Actions */}
            <ModernCard>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('quickActions') || 'Quick Actions'}
              </h2>
              
              <div className="space-y-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/channels')}
                  className="w-full flex items-center justify-between p-4 bg-telegram-50 dark:bg-telegram-900/20 hover:bg-telegram-100 dark:hover:bg-telegram-900/30 rounded-xl transition-colors group"
                >
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-telegram-600 dark:text-telegram-400 mr-3" />
                    <span className="text-sm font-medium text-telegram-700 dark:text-telegram-300">
                      {t('addNewChannel') || 'Add New Channel'}
                    </span>
                  </div>
                  <div className="w-6 h-6 bg-telegram-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlusIcon className="w-3 h-3 text-white" />
                  </div>
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/destinations')}
                  className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors group"
                >
                  <div className="flex items-center">
                    <PaperAirplaneIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {t('setupForwarding') || 'Setup Forwarding'}
                    </span>
                  </div>
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/logs')}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors group"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {t('viewLogs') || 'View Logs'}
                    </span>
                  </div>
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DocumentTextIcon className="w-3 h-3 text-white" />
                  </div>
                </motion.button>
              </div>
            </ModernCard>

            {/* Recent Activity */}
            <ModernCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('recentActivity') || 'Recent Activity'}
                </h2>
                <button className="text-sm text-telegram-600 hover:text-telegram-700 dark:text-telegram-400 dark:hover:text-telegram-300 font-medium">
                  {t('viewAll') || 'View All'}
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : (
                  recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    const colorClasses = {
                      telegram: 'bg-telegram-100 dark:bg-telegram-900 text-telegram-600 dark:text-telegram-400',
                      green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
                      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
                      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
                      yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                    };
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${colorClasses[activity.color as keyof typeof colorClasses] || colorClasses.telegram}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {activity.timestamp}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ModernCard>
          </motion.div>
        </div>

        {/* Quick Add Keyword Modal */}
        <AnimatePresence>
          {showKeywordForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowKeywordForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('addNewKeyword') || 'Add New Keyword'}
                  </h3>
                  <button
                    onClick={() => setShowKeywordForm(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleAddKeyword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('keyword') || 'Keyword'}
                    </label>
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder={t('enterKeyword') || 'Enter keyword to track...'}
                      className="input-modern w-full"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <ModernButton
                      variant="ghost"
                      onClick={() => setShowKeywordForm(false)}
                      type="button"
                    >
                      {t('cancel') || 'Cancel'}
                    </ModernButton>
                    <ModernButton
                      variant="primary"
                      type="submit"
                      loading={addKeywordMutation.isPending}
                      disabled={addKeywordMutation.isPending}
                    >
                      {addKeywordMutation.isPending ? (t('adding') || 'Adding...') : (t('addKeyword') || 'Add Keyword')}
                    </ModernButton>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
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