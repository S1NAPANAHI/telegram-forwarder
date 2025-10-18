import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import AppLayout from '../../components/Layout/AppLayout';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SignalIcon,
  UserGroupIcon,
  HashtagIcon,
  PaperAirplaneIcon,
  EyeIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isLoading?: boolean;
}

interface QuickAction {
  name: string;
  href: string;
  icon: any;
  color: string;
  description: string;
}

interface RecentActivity {
  id: string;
  type: 'message' | 'channel' | 'keyword' | 'error';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

function StatCard({ title, value, change, icon: Icon, color, isLoading }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-telegram-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600'
  };

  const bgClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {value}
            </p>
          )}
          {!isLoading && (
            <div className="flex items-center space-x-2">
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-4 rounded-2xl ${bgClasses[color]}`}>
          <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [stats, setStats] = useState({
    totalChannels: 0,
    messagesForwarded: 0,
    activeKeywords: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const quickActions: QuickAction[] = [
    {
      name: t('addChannel') || 'Add Channel',
      href: '/channels',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-gradient-to-r from-blue-500 to-telegram-600',
      description: t('addNewChannelDesc') || 'Monitor new channels'
    },
    {
      name: t('discovery') || 'Discovery',
      href: '/discovery',
      icon: MagnifyingGlassIcon,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      description: t('discoverChannelsDesc') || 'Find channels to monitor'
    },
    {
      name: t('keywords') || 'Keywords',
      href: '/keywords',
      icon: HashtagIcon,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      description: t('manageKeywordsDesc') || 'Manage keyword filters'
    },
    {
      name: t('analytics') || 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      description: t('viewAnalyticsDesc') || 'View detailed analytics'
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'message',
      title: 'New message forwarded',
      description: 'Message containing "crypto" forwarded from @TechNews',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'channel',
      title: 'Channel discovered',
      description: 'New channel @CryptoDailyNews discovered and added',
      timestamp: '15 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'keyword',
      title: 'Keyword match',
      description: '"bitcoin" keyword matched in 3 messages',
      timestamp: '1 hour ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'error',
      title: 'Connection issue',
      description: 'Temporary connection issue with @NewsChannel',
      timestamp: '2 hours ago',
      status: 'warning'
    }
  ];

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalChannels: 12,
        messagesForwarded: 1247,
        activeKeywords: 8,
        successRate: 98.5
      });
      setIsLoading(false);
    }, 1500);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return PaperAirplaneIcon;
      case 'channel': return ChatBubbleLeftRightIcon;
      case 'keyword': return HashtagIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return DocumentTextIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <AppLayout title={t('dashboard') || 'Dashboard'}>
      <Head>
        <title>{t('dashboard')} - {t('telegramForwarder')}</title>
        <meta name="description" content={t('dashboardDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('welcomeToDashboard') || 'Welcome to your Dashboard'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('dashboardSubtitle') || 'Monitor your Telegram forwarding activity'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                isMonitoring 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {isMonitoring ? (t('monitoring') || 'Monitoring') : (t('paused') || 'Paused')}
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isMonitoring 
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200'
                }`}
              >
                {isMonitoring ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          <StatCard
            title={t('totalChannels') || 'Total Channels'}
            value={stats.totalChannels}
            change={12.5}
            icon={ChatBubbleLeftRightIcon}
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            title={t('messagesForwarded') || 'Messages Forwarded'}
            value={stats.messagesForwarded.toLocaleString()}
            change={23.1}
            icon={PaperAirplaneIcon}
            color="green"
            isLoading={isLoading}
          />
          <StatCard
            title={t('activeKeywords') || 'Active Keywords'}
            value={stats.activeKeywords}
            change={-2.4}
            icon={HashtagIcon}
            color="purple"
            isLoading={isLoading}
          />
          <StatCard
            title={t('successRate') || 'Success Rate'}
            value={`${stats.successRate}%`}
            change={5.2}
            icon={CheckCircleIcon}
            color="orange"
            isLoading={isLoading}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('quickActions') || 'Quick Actions'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Link href={action.href}>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-telegram-600 dark:text-telegram-400">
                      <span className="text-sm font-medium">{t('getStarted') || 'Get started'}</span>
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('recentActivity') || 'Recent Activity'}
                </h2>
                <Link href="/logs">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-telegram-600 dark:text-telegram-400 hover:text-telegram-700 dark:hover:text-telegram-300 text-sm font-medium flex items-center"
                  >
                    <span>{t('viewAll') || 'View all'}</span>
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </motion.button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        <ActivityIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {activity.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('systemStatus') || 'System Status'}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t('botStatus') || 'Bot Status'}
                    </span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {t('online') || 'Online'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <SignalIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t('apiConnection') || 'API Connection'}
                    </span>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {t('stable') || 'Stable'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <UserGroupIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t('activeChannels') || 'Active Channels'}
                    </span>
                  </div>
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {stats.totalChannels}/15
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <EyeIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t('monitoring') || 'Monitoring'}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    isMonitoring 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isMonitoring ? (t('active') || 'Active') : (t('paused') || 'Paused')}
                  </span>
                </div>
              </div>
              
              <Link href="/settings">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 btn-secondary"
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-2" />
                  {t('systemSettings') || 'System Settings'}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});