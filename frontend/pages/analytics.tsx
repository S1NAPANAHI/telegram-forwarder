import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
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
  AreaChart,
  Area,
} from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

interface AnalyticsData {
  dailyStats: Array<{
    date: string;
    messages: number;
    forwards: number;
    success_rate: number;
  }>;
  keywordPerformance: Array<{
    keyword: string;
    matches: number;
    success_rate: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  channelActivity: Array<{
    channel: string;
    platform: string;
    messages: number;
    keywords_matched: number;
    efficiency: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    activity: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const Analytics: React.FC = () => {
  const { t } = useTranslation('common');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'messages' | 'forwards' | 'success_rate'>('forwards');

  // Mock analytics data - replace with real API calls
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      return {
        dailyStats: Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          const messages = Math.floor(Math.random() * 100) + 50;
          const forwards = Math.floor(messages * (0.7 + Math.random() * 0.25));
          
          return {
            date: date.toISOString().split('T')[0],
            messages,
            forwards,
            success_rate: Math.round((forwards / messages) * 100),
          };
        }),
        keywordPerformance: [
          { keyword: 'breaking news', matches: 156, success_rate: 95.5, trend: 'up' as const },
          { keyword: 'cryptocurrency', matches: 134, success_rate: 97.8, trend: 'up' as const },
          { keyword: 'market analysis', matches: 89, success_rate: 87.6, trend: 'down' as const },
          { keyword: 'AI technology', matches: 67, success_rate: 92.5, trend: 'stable' as const },
          { keyword: 'stock market', matches: 52, success_rate: 89.2, trend: 'up' as const },
        ],
        channelActivity: [
          { channel: 'Tech News', platform: 'telegram', messages: 245, keywords_matched: 89, efficiency: 89 },
          { channel: 'Crypto Updates', platform: 'telegram', messages: 198, keywords_matched: 76, efficiency: 76 },
          { channel: 'Financial Reports', platform: 'telegram', messages: 134, keywords_matched: 45, efficiency: 62 },
          { channel: 'News Eitaa', platform: 'eitaa', messages: 56, keywords_matched: 12, efficiency: 34 },
        ],
        timeDistribution: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          activity: Math.floor(Math.random() * 50) + 10,
        })),
      };
    },
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!analyticsData) return { totalMessages: 0, totalForwards: 0, avgSuccessRate: 0, topKeyword: '' };
    
    const totalMessages = analyticsData.dailyStats.reduce((sum, day) => sum + day.messages, 0);
    const totalForwards = analyticsData.dailyStats.reduce((sum, day) => sum + day.forwards, 0);
    const avgSuccessRate = totalMessages > 0 ? Math.round((totalForwards / totalMessages) * 100) : 0;
    const topKeyword = analyticsData.keywordPerformance[0]?.keyword || 'N/A';
    
    return { totalMessages, totalForwards, avgSuccessRate, topKeyword };
  }, [analyticsData]);

  // Chart data for different time ranges
  const chartData = useMemo(() => {
    if (!analyticsData) return [];
    
    return analyticsData.dailyStats.map(day => ({
      ...day,
      dateFormatted: new Date(day.date).toLocaleDateString('en', { 
        month: 'short', 
        day: 'numeric',
        ...(timeRange === '90d' && { year: '2-digit' })
      }),
    }));
  }, [analyticsData, timeRange]);

  // Keyword performance table columns
  const keywordColumns = [
    {
      key: 'keyword',
      label: 'Keyword',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'matches',
      label: 'Matches',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'success_rate',
      label: 'Success Rate',
      sortable: true,
      render: (value: number) => (
        <span className={`font-medium ${
          value >= 95 ? 'text-green-600 dark:text-green-400' :
          value >= 85 ? 'text-yellow-600 dark:text-yellow-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {value}%
        </span>
      ),
    },
    {
      key: 'trend',
      label: 'Trend',
      render: (value: 'up' | 'down' | 'stable') => {
        const config = {
          up: { icon: ArrowTrendingUpIcon, color: 'text-green-600 dark:text-green-400' },
          down: { icon: ArrowTrendingDownIcon, color: 'text-red-600 dark:text-red-400' },
          stable: { icon: null, color: 'text-gray-500 dark:text-gray-400' },
        };
        
        const { icon: Icon, color } = config[value];
        
        return (
          <div className={`flex items-center ${color}`}>
            {Icon && <Icon className="h-4 w-4 mr-1" />}
            <span className="capitalize">{value}</span>
          </div>
        );
      },
    },
  ];

  // Channel activity table columns
  const channelColumns = [
    {
      key: 'channel',
      label: 'Channel',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            row.platform === 'telegram' ? 'bg-blue-400' : 'bg-purple-400'
          }`} />
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'messages',
      label: 'Messages',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'keywords_matched',
      label: 'Matched',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'efficiency',
      label: 'Efficiency',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                value >= 80 ? 'bg-green-500' :
                value >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      ),
    },
  ];

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Messages,Forwards,Success Rate\n" +
      analyticsData.dailyStats.map(row => 
        `${row.date},${row.messages},${row.forwards},${row.success_rate}%`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitor and analyze your bot's performance metrics
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <DocumentArrowDownIcon className="-ml-1 mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Messages"
            value={summaryStats.totalMessages}
            icon={<ChartBarIcon className="h-6 w-6" />}
            change={{ value: '+8.2%', type: 'increase' }}
            loading={isLoading}
          />
          <StatCard
            title="Messages Forwarded"
            value={summaryStats.totalForwards}
            icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
            change={{ value: '+12.5%', type: 'increase' }}
            loading={isLoading}
          />
          <StatCard
            title="Average Success Rate"
            value={`${summaryStats.avgSuccessRate}%`}
            icon={<FunnelIcon className="h-6 w-6" />}
            change={{ value: '+2.1%', type: 'increase' }}
            loading={isLoading}
          />
          <StatCard
            title="Top Keyword"
            value={summaryStats.topKeyword}
            icon={<CalendarDaysIcon className="h-6 w-6" />}
            loading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Analytics Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Performance Over Time
              </h3>
              <div className="flex items-center space-x-2">
                {(['messages', 'forwards', 'success_rate'] as const).map(metric => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                      selectedMetric === metric
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {selectedMetric === 'success_rate' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="dateFormatted" 
                        className="text-xs text-gray-600 dark:text-gray-400"
                      />
                      <YAxis 
                        className="text-xs text-gray-600 dark:text-gray-400"
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={selectedMetric} 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="dateFormatted" 
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
                      <Area
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Activity by Hour
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.timeDistribution || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="hour" 
                  className="text-xs text-gray-600 dark:text-gray-400"
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelFormatter={(value) => `${value}:00`}
                />
                <Bar 
                  dataKey="activity" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Keyword Performance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Keyword Performance
            </h3>
            <DataTable
              columns={keywordColumns}
              data={analyticsData?.keywordPerformance || []}
              loading={isLoading}
              searchable={false}
              pagination={false}
            />
          </div>

          {/* Channel Activity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Channel Activity
            </h3>
            <DataTable
              columns={channelColumns}
              data={analyticsData?.channelActivity || []}
              loading={isLoading}
              searchable={false}
              pagination={false}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const translations = await serverSideTranslations(locale ?? 'en', ['common']);
  return {
    props: {
      ...translations,
    },
  };
};