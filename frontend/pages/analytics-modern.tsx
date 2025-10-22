import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ModernCard from '../components/ui/ModernCard';
import { ThemeToggle } from '../components/ui/ThemeProvider';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalMessages: number;
  successfulForwards: number;
  failedForwards: number;
  averageResponseTime: number;
  topChannels: Array<{
    name: string;
    messageCount: number;
    successRate: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    messages: number;
  }>;
  dailyStats: Array<{
    date: string;
    messages: number;
    success: number;
    failures: number;
  }>;
}

const AnalyticsModern: React.FC = () => {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalMessages: 0,
    successfulForwards: 0,
    failedForwards: 0,
    averageResponseTime: 0,
    topChannels: [],
    hourlyStats: [],
    dailyStats: []
  });
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const successRate = analyticsData.totalMessages > 0 
    ? ((analyticsData.successfulForwards / analyticsData.totalMessages) * 100).toFixed(1)
    : 0;

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const HourlyChart = () => {
    const maxMessages = Math.max(...analyticsData.hourlyStats.map(stat => stat.messages));
    
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Message Activity (24 Hours)</h3>
        <div className="flex items-end space-x-2 h-48">
          {analyticsData.hourlyStats.map((stat, index) => {
            const height = maxMessages > 0 ? (stat.messages / maxMessages) * 100 : 0;
            return (
              <div key={stat.hour} className="flex-1 flex flex-col items-center group">
                <div 
                  className={`w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm transition-all duration-1000 delay-${index * 50} group-hover:from-blue-400 group-hover:to-purple-400 cursor-pointer`}
                  style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                ></div>
                <div className="text-xs text-gray-400 mt-2">{stat.hour}h</div>
                <div className="text-xs text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">{stat.messages}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const CircularProgress = ({ percentage, color, label, size = 100 }: { percentage: number; color: string; label: string; size?: number }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center space-y-3 group">
        <div className="relative">
          <svg className="transform -rotate-90 transition-transform group-hover:scale-110" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-700 dark:text-gray-600"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white group-hover:text-xl transition-all">
              {percentage}%
            </span>
          </div>
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-blue-900 p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-gradient">Analytics Dashboard</span>
            </h1>
            <p className="text-emerald-200 text-lg">Monitor your forwarding performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/dashboard-modern')}
              className="btn-ghost flex items-center space-x-2"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ModernCard variant="feature" className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Time Range</h3>
              <div className="flex space-x-2">
                {(['24h', '7d', '30d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                      timeRange === range
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                  </button>
                ))}
              </div>
            </div>
          </ModernCard>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Key Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernCard variant="stats" className="text-center card-hover">
              <div className="space-y-4">
                <div className="text-4xl animate-bounce-soft">📨</div>
                <div className="text-3xl font-bold text-emerald-400">
                  {analyticsData.totalMessages.toLocaleString()}
                </div>
                <div className="text-gray-300 text-sm font-medium">Total Messages</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </ModernCard>

            <ModernCard variant="feature" className="text-center card-hover">
              <div className="space-y-4">
                <div className="text-4xl animate-bounce-soft animation-delay-100">✅</div>
                <div className="text-3xl font-bold text-green-400">
                  {analyticsData.successfulForwards.toLocaleString()}
                </div>
                <div className="text-gray-300 text-sm font-medium">Successful Forwards</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{width: `${successRate}%`}}></div>
                </div>
              </div>
            </ModernCard>

            <ModernCard variant="action" className="text-center card-hover">
              <div className="space-y-4">
                <div className="text-4xl animate-bounce-soft animation-delay-200">⚠️</div>
                <div className="text-3xl font-bold text-red-400">
                  {analyticsData.failedForwards.toLocaleString()}
                </div>
                <div className="text-gray-300 text-sm font-medium">Failed Forwards</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full" style={{width: `${100 - parseFloat(successRate.toString())}%`}}></div>
                </div>
              </div>
            </ModernCard>

            <ModernCard variant="stats" className="text-center card-hover">
              <div className="space-y-4">
                <div className="text-4xl animate-bounce-soft animation-delay-300">⏱️</div>
                <div className="text-3xl font-bold text-blue-400">
                  {analyticsData.averageResponseTime}ms
                </div>
                <div className="text-gray-300 text-sm font-medium">Avg Response Time</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hourly Activity Chart */}
            <motion.div variants={itemVariants}>
              <ModernCard className="h-80 card-hover">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading chart data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <HourlyChart />
                  </div>
                )}
              </ModernCard>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div variants={itemVariants}>
              <ModernCard className="h-80 card-hover">
                <div className="p-6 space-y-6">
                  <h3 className="text-xl font-semibold text-white">Performance Metrics</h3>
                  <div className="flex justify-around items-center h-48">
                    <CircularProgress 
                      percentage={parseFloat(successRate.toString())}
                      color="#10b981"
                      label="Success Rate"
                    />
                    <CircularProgress 
                      percentage={analyticsData.totalMessages > 0 ? ((analyticsData.failedForwards / analyticsData.totalMessages) * 100) : 0}
                      color="#ef4444"
                      label="Failure Rate"
                    />
                    <CircularProgress 
                      percentage={Math.min(100 - (analyticsData.averageResponseTime / 10), 100)}
                      color="#3b82f6"
                      label="Speed Index"
                    />
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          </div>

          {/* Top Performing Channels */}
          <motion.div variants={itemVariants}>
            <ModernCard className="card-hover">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-3 text-2xl">🏆</span>
                    Top Performing Channels
                  </h3>
                  <button className="btn-ghost text-sm">
                    View All
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading channels...</p>
                  </div>
                ) : analyticsData.topChannels.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.topChannels.map((channel, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                              {channel.name}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {channel.messageCount.toLocaleString()} messages
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold text-lg group-hover:text-emerald-300 transition-colors">
                            {channel.successRate}%
                          </div>
                          <div className="text-gray-400 text-sm">success rate</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6 animate-bounce-soft">📊</div>
                    <h4 className="text-xl font-semibold text-white mb-2">No Data Available</h4>
                    <p className="text-gray-400 mb-6">
                      No analytics data available for the selected time period.
                    </p>
                    <button 
                      onClick={fetchAnalytics}
                      className="btn-modern"
                    >
                      <i className="fas fa-sync-alt mr-2"></i>
                      Refresh Data
                    </button>
                  </div>
                )}
              </div>
            </ModernCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsModern;