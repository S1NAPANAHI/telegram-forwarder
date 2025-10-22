import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ModernCard from '../components/ui/ModernCard';
import { ThemeToggle } from '../components/ui/ThemeProvider';
import { motion } from 'framer-motion';
import Layout from '../components/Layout'; // Import the Layout component

interface DashboardStats {
  totalChannels: number;
  activeForwards: number;
  messagesForwarded: number;
  successRate: number;
}

interface ForwardingRule {
  id: string;
  sourceChannel: string;
  targetChannel: string;
  isActive: boolean;
  messagesCount: number;
}

const ModernDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalChannels: 0,
    activeForwards: 0,
    messagesForwarded: 0,
    successRate: 0
  });
  const [forwardingRules, setForwardingRules] = useState<ForwardingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/modern-auth');
        return;
      }

      // Fetch stats
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch forwarding rules
      const rulesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forwarding-rules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setForwardingRules(rulesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        {/* Header - This will be replaced by the Layout component's header */}
        {/* <div className="relative z-10 flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Telegram Forwarder</h1>
            <p className="text-blue-200 text-lg">Manage your message forwarding with ease</p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/auth/modern-auth');
              }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div> */}

        {/* Main Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 space-y-8"
        >
          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernCard variant="stats" className="text-center">
              <div className="space-y-3">
                <div className="text-3xl">📱</div>
                <div className="text-2xl font-bold text-emerald-400">{stats.totalChannels}</div>
                <div className="text-gray-300 text-sm">Total Channels</div>
              </div>
            </ModernCard>

            <ModernCard variant="feature" className="text-center">
              <div className="space-y-3">
                <div className="text-3xl">🔄</div>
                <div className="text-2xl font-bold text-blue-400">{stats.activeForwards}</div>
                <div className="text-gray-300 text-sm">Active Forwards</div>
              </div>
            </ModernCard>

            <ModernCard variant="action" className="text-center">
              <div className="space-y-3">
                <div className="text-3xl">📨</div>
                <div className="text-2xl font-bold text-orange-400">{stats.messagesForwarded.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Messages Forwarded</div>
              </div>
            </ModernCard>

            <ModernCard variant="stats" className="text-center">
              <div className="space-y-3">
                <div className="text-3xl">✅</div>
                <div className="text-2xl font-bold text-green-400">{stats.successRate}%</div>
                <div className="text-gray-300 text-sm">Success Rate</div>
              </div>
            </ModernCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <ModernCard variant="feature" hover glow className="cursor-pointer" onClick={() => router.push('/channels')}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Discover Channels</h3>
                    <p className="text-gray-300 text-sm">Find and connect new channels</p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard variant="action" hover glow className="cursor-pointer" onClick={() => router.push('/destinations')}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Manage Destinations</h3>
                    <p className="text-gray-300 text-sm">Configure forwarding targets</p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard variant="stats" hover glow className="cursor-pointer" onClick={() => router.push('/analytics')}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">View Analytics</h3>
                    <p className="text-gray-300 text-sm">Track performance metrics</p>
                  </div>
                </div>
              </ModernCard>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-6">Forwarding Rules</h2>
            <ModernCard>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading...</p>
                  </div>
                ) : forwardingRules.length > 0 ? (
                  forwardingRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <div className="text-white font-medium">{rule.sourceChannel}</div>
                          <div className="text-gray-400 text-sm">→ {rule.targetChannel}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{rule.messagesCount}</div>
                        <div className="text-gray-400 text-sm">messages</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-gray-400">No forwarding rules configured yet.</p>
                    <button 
                      onClick={() => router.push('/destinations')}
                      className="mt-4 px-6 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-all duration-200"
                    >
                      Create First Rule
                    </button>
                  </div>
                )}
              </div>
            </ModernCard>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ModernDashboard;