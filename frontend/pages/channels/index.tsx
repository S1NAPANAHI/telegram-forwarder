import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import AppLayout from '../../components/Layout/AppLayout';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  HashtagIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SignalIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Channel {
  id: string;
  name: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
  memberCount?: number;
  isActive: boolean;
  isMonitoring: boolean;
  lastActivity?: string;
  messagesForwarded: number;
  keywordMatches: number;
  status: 'online' | 'offline' | 'error';
  isAdmin: boolean;
  description?: string;
}

interface ChannelCardProps {
  channel: Channel;
  onToggleMonitoring: (id: string) => void;
  onEdit: (channel: Channel) => void;
  onDelete: (id: string) => void;
}

function ChannelCard({ channel, onToggleMonitoring, onEdit, onDelete }: ChannelCardProps) {
  const { t } = useTranslation('common');
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'offline': return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
      case 'error': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircleIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return XCircleIcon;
    }
  };

  const StatusIcon = getStatusIcon(channel.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1 min-w-0">
          <div className={`p-3 rounded-xl ${
            channel.type === 'channel' 
              ? 'bg-blue-100 dark:bg-blue-900/20' 
              : 'bg-purple-100 dark:bg-purple-900/20'
          }`}>
            {channel.type === 'channel' ? (
              <ChatBubbleLeftRightIcon className={`w-6 h-6 ${
                channel.type === 'channel'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-purple-600 dark:text-purple-400'
              }`} />
            ) : (
              <UserGroupIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {channel.name}
            </h3>
            {channel.username && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                @{channel.username}
              </p>
            )}
            {channel.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {channel.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Status Badge */}
          <div className={`flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(channel.status)}`}>
            <StatusIcon className="w-3 h-3" />
            <span className="capitalize">{channel.status}</span>
          </div>
          
          {/* Admin Badge */}
          {channel.isAdmin && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-lg text-xs font-medium">
              {t('admin') || 'Admin'}
            </div>
          )}
          
          {/* Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
            </motion.button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10"
                >
                  <div className="py-2">
                    <button
                      onClick={() => {
                        onEdit(channel);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>{t('edit') || 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onToggleMonitoring(channel.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {channel.isMonitoring ? (
                        <>
                          <EyeSlashIcon className="w-4 h-4" />
                          <span>{t('stopMonitoring') || 'Stop Monitoring'}</span>
                        </>
                      ) : (
                        <>
                          <EyeIcon className="w-4 h-4" />
                          <span>{t('startMonitoring') || 'Start Monitoring'}</span>
                        </>
                      )}
                    </button>
                    <hr className="my-2 border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        onDelete(channel.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>{t('delete') || 'Delete'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {channel.messagesForwarded || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('forwarded') || 'Forwarded'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {channel.keywordMatches || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('matches') || 'Matches'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {channel.memberCount ? `${(channel.memberCount / 1000).toFixed(1)}k` : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('members') || 'Members'}
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="w-4 h-4" />
          <span>
            {channel.lastActivity 
              ? `${t('lastActivity')} ${channel.lastActivity}`
              : t('noActivity') || 'No activity'
            }
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleMonitoring(channel.id)}
          className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            channel.isMonitoring
              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200'
              : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200'
          }`}
        >
          {channel.isMonitoring ? (
            <>
              <PauseIcon className="w-4 h-4" />
              <span>{t('pause') || 'Pause'}</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              <span>{t('monitor') || 'Monitor'}</span>
            </>
          )}
        </motion.button>
      </div>
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
}

export default function Channels() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'monitoring'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      const mockChannels: Channel[] = [
        {
          id: '1',
          name: 'Tech News Daily',
          username: 'technewsdaily',
          type: 'channel',
          memberCount: 15420,
          isActive: true,
          isMonitoring: true,
          lastActivity: '2 mins ago',
          messagesForwarded: 127,
          keywordMatches: 45,
          status: 'online',
          isAdmin: true,
          description: 'Latest tech news and updates from around the world'
        },
        {
          id: '2',
          name: 'Crypto Signals',
          username: 'cryptosignals',
          type: 'channel',
          memberCount: 8930,
          isActive: true,
          isMonitoring: false,
          lastActivity: '1 hour ago',
          messagesForwarded: 89,
          keywordMatches: 23,
          status: 'online',
          isAdmin: false,
          description: 'Professional cryptocurrency trading signals'
        },
        {
          id: '3',
          name: 'Developer Community',
          username: 'devcom',
          type: 'supergroup',
          memberCount: 3240,
          isActive: true,
          isMonitoring: true,
          lastActivity: '5 mins ago',
          messagesForwarded: 203,
          keywordMatches: 67,
          status: 'online',
          isAdmin: true,
          description: 'A community for developers to share knowledge and collaborate'
        },
        {
          id: '4',
          name: 'News Channel',
          username: 'newschannel',
          type: 'channel',
          memberCount: 25600,
          isActive: false,
          isMonitoring: false,
          lastActivity: '2 days ago',
          messagesForwarded: 45,
          keywordMatches: 12,
          status: 'error',
          isAdmin: false,
          description: 'Breaking news from reliable sources'
        }
      ];
      
      setChannels(mockChannels);
      setFilteredChannels(mockChannels);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter channels based on search and status
  useEffect(() => {
    let filtered = channels;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'monitoring') {
        filtered = filtered.filter(channel => channel.isMonitoring);
      } else {
        filtered = filtered.filter(channel => channel.status === filterStatus);
      }
    }
    
    setFilteredChannels(filtered);
  }, [channels, searchQuery, filterStatus]);

  const handleToggleMonitoring = (id: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === id 
        ? { ...channel, isMonitoring: !channel.isMonitoring }
        : channel
    ));
  };

  const handleEdit = (channel: Channel) => {
    // Implement edit functionality
    console.log('Edit channel:', channel);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete') || 'Are you sure you want to delete this channel?')) {
      setChannels(prev => prev.filter(channel => channel.id !== id));
    }
  };

  const getFilterCount = (status: string) => {
    switch (status) {
      case 'all': return channels.length;
      case 'online': return channels.filter(c => c.status === 'online').length;
      case 'offline': return channels.filter(c => c.status === 'offline').length;
      case 'monitoring': return channels.filter(c => c.isMonitoring).length;
      default: return 0;
    }
  };

  return (
    <AppLayout title={t('channels') || 'Channels'}>
      <Head>
        <title>{t('channels')} - {t('telegramForwarder')}</title>
        <meta name="description" content={t('channelsDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('channelManagement') || 'Channel Management'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('channelSubtitle') || 'Monitor and manage your Telegram channels'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Link href="/discovery">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{t('discover') || 'Discover'}</span>
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('addChannel') || 'Add Channel'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchChannels') || 'Search channels...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-modern pl-10"
                />
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto">
                {[
                  { key: 'all', label: t('all') || 'All' },
                  { key: 'monitoring', label: t('monitoring') || 'Monitoring' },
                  { key: 'online', label: t('online') || 'Online' },
                  { key: 'offline', label: t('offline') || 'Offline' }
                ].map((filter) => (
                  <motion.button
                    key={filter.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterStatus(filter.key as any)}
                    className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                      filterStatus === filter.key
                        ? 'bg-telegram-100 dark:bg-telegram-900/20 text-telegram-600 dark:text-telegram-400 border border-telegram-200 dark:border-telegram-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FunnelIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{filter.label}</span>
                    <span className="bg-white dark:bg-gray-800 text-xs px-2 py-0.5 rounded-full">
                      {getFilterCount(filter.key)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Channels Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="text-center">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChannels.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || filterStatus !== 'all' 
                  ? (t('noChannelsFound') || 'No channels found')
                  : (t('noChannelsYet') || 'No channels yet')
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchQuery || filterStatus !== 'all'
                  ? (t('tryDifferentSearch') || 'Try adjusting your search or filters')
                  : (t('addFirstChannel') || 'Add your first channel to start monitoring')
                }
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                  >
                    {t('addChannel') || 'Add Channel'}
                  </motion.button>
                  <Link href="/discovery">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary"
                    >
                      {t('discoverChannels') || 'Discover Channels'}
                    </motion.button>
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredChannels.map((channel, index) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ChannelCard
                    channel={channel}
                    onToggleMonitoring={handleToggleMonitoring}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});