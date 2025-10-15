import { useState, useEffect } from 'react';
import RouteGuard from '../components/auth/RouteGuard';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import api from '../lib/api';
import { 
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalMessages: number;
  todayMessages: number;
  totalChannels: number;
  activeChannels: number;
  totalDestinations: number;
  activeDestinations: number;
  totalKeywords: number;
  activeKeywords: number;
  weeklyActivity: { [date: string]: number };
  recentLogs: MessageLog[];
  successRate: number;
  averageProcessingTime: number;
}

interface MessageLog {
  id: string;
  original_message_text: string;
  matched_text: string;
  status: 'success' | 'error' | 'pending';
  processing_time_ms: number;
  created_at: string;
  keyword?: { keyword: string };
  channel?: { channel_name: string };
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  loading?: boolean;
}

function StatCard({ title, value, change, changeType, icon: Icon, loading }: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return 'text-green-600 dark:text-green-400';
      case 'decrease': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline mt-2">
            {loading ? (
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {change && (
                  <p className={`ml-2 text-sm font-medium ${getChangeColor()}`}>
                    {change}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );
}

function ActivityChart({ data, loading }: { data: { [date: string]: number }, loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">7-Day Activity</h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const sortedDates = Object.keys(data).sort();
  const maxValue = Math.max(...Object.values(data), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">7-Day Activity</h3>
      <div className="h-64 flex items-end space-x-2">
        {sortedDates.map((date) => {
          const value = data[date] || 0;
          const height = (value / maxValue) * 100;
          const dateObj = new Date(date);
          
          return (
            <div key={date} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t" style={{ height: '200px' }}>
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 flex items-end justify-center"
                  style={{ height: `${height}%` }}
                >
                  {value > 0 && (
                    <span className="text-white text-xs font-medium mb-1">{value}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {dateObj.toLocaleDateString('en', { weekday: 'short', month: 'numeric', day: 'numeric' })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Analytics() {
  const { t } = useTranslation('common');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      
      setError(null);
      
      // Fetch all analytics data in parallel
      const [statsRes, logsRes, activityRes] = await Promise.all([
        api.get('/api/analytics/stats'),
        api.get('/api/logs?limit=10'),
        api.get('/api/analytics/activity')
      ]);

      const analyticsData: AnalyticsData = {
        ...statsRes.data,
        recentLogs: logsRes.data.logs || [],
        weeklyActivity: activityRes.data.activity || {}
      };

      setAnalytics(analyticsData);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="w-4 h-4" />;
      case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <RouteGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('analytics')}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('detailedAnalyticsAndReports')}
              </p>
              {lastRefresh && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Messages"
              value={analytics?.totalMessages || 0}
              change={analytics?.todayMessages ? `+${analytics.todayMessages} today` : undefined}
              changeType="increase"
              icon={ChatBubbleLeftRightIcon}
              loading={loading}
            />
            <StatCard
              title="Active Channels"
              value={`${analytics?.activeChannels || 0}/${analytics?.totalChannels || 0}`}
              icon={EyeIcon}
              loading={loading}
            />
            <StatCard
              title="Destinations"
              value={`${analytics?.activeDestinations || 0}/${analytics?.totalDestinations || 0}`}
              icon={UsersIcon}
              loading={loading}
            />
            <StatCard
              title="Success Rate"
              value={analytics?.successRate ? `${analytics.successRate.toFixed(1)}%` : '0%'}
              changeType={analytics?.successRate && analytics.successRate > 95 ? 'increase' : 'neutral'}
              icon={ChartBarIcon}
              loading={loading}
            />
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Chart */}
            <ActivityChart 
              data={analytics?.weeklyActivity || {}} 
              loading={loading} 
            />

            {/* Recent Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : analytics?.recentLogs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-4">
                    {analytics?.recentLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {log.matched_text || 'Message processed'}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                            {log.keyword?.keyword && (
                              <span>Keyword: {log.keyword.keyword}</span>
                            )}
                            {log.channel?.channel_name && (
                              <span>From: {log.channel.channel_name}</span>
                            )}
                            <span>{log.processing_time_ms}ms</span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Performance Metrics
              </h3>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Processing Time</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {analytics?.averageProcessingTime || 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {analytics?.successRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Processed</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {analytics?.totalMessages?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                System Status
              </h3>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Keywords</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {analytics?.activeKeywords || 0} / {analytics?.totalKeywords || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monitoring Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (analytics?.activeChannels || 0) > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {(analytics?.activeChannels || 0) > 0 ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </RouteGuard>
  );
}

export default Analytics;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fa', ['common'])),
  },
});