import { useState, useEffect } from 'react';
import RouteGuard from '../components/auth/RouteGuard';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import api from '../lib/api';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface DiscoveredChat {
  id: string;
  user_id: string;
  chat_id: string;
  chat_type: 'channel' | 'group' | 'supergroup' | 'private';
  chat_title?: string | null;
  chat_username?: string | null;
  is_admin: boolean;
  is_member: boolean;
  is_promoted: boolean;
  discovery_method?: string | null;
  last_discovered: string;
  created_at: string;
  updated_at: string;
}

interface DiscoveryStats {
  total: number;
  admin: number;
  promoted: number;
  channels: number;
  groups: number;
}

export default function DiscoveryPage() {
  const { t } = useTranslation('common');
  const [discoveredChats, setDiscoveredChats] = useState<DiscoveredChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'admin' | 'member' | 'promoted'>('all');
  const [filterType, setFilterType] = useState<'all' | 'channel' | 'group' | 'supergroup'>('all');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [promoting, setPromoting] = useState(false);
  const [stats, setStats] = useState<DiscoveryStats | null>(null);

  const fetchDiscoveredChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/discovery');
      setDiscoveredChats(response.data || []);
      calculateStats(response.data || []);
    } catch (err: any) {
      console.error('Error fetching discovered chats:', err);
      setError(err.response?.data?.error || 'Failed to load discovered chats');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (chats: DiscoveredChat[]) => {
    const stats = {
      total: chats.length,
      admin: chats.filter(c => c.is_admin).length,
      promoted: chats.filter(c => c.is_promoted).length,
      channels: chats.filter(c => c.chat_type === 'channel').length,
      groups: chats.filter(c => ['group', 'supergroup'].includes(c.chat_type)).length
    };
    setStats(stats);
  };

  const triggerDiscovery = async () => {
    try {
      setScanning(true);
      setError(null);
      await api.post('/api/discovery/scan');
      setSuccess('Discovery scan completed successfully!');
      await fetchDiscoveredChats();
    } catch (err: any) {
      console.error('Error triggering discovery:', err);
      setError(err.response?.data?.error || 'Failed to trigger discovery scan');
    } finally {
      setScanning(false);
    }
  };

  const promoteChat = async (chatId: string) => {
    try {
      setError(null);
      await api.post(`/api/discovery/${chatId}/promote`);
      setSuccess('Chat promoted to monitoring successfully!');
      await fetchDiscoveredChats();
    } catch (err: any) {
      console.error('Error promoting chat:', err);
      setError(err.response?.data?.error || 'Failed to promote chat');
    }
  };

  const bulkPromoteChats = async () => {
    if (selectedChats.length === 0) {
      setError('No chats selected for promotion');
      return;
    }

    try {
      setPromoting(true);
      setError(null);
      await api.post('/api/discovery/bulk-promote', {
        chat_ids: selectedChats
      });
      setSuccess(`${selectedChats.length} chats promoted to monitoring successfully!`);
      setSelectedChats([]);
      await fetchDiscoveredChats();
    } catch (err: any) {
      console.error('Error bulk promoting chats:', err);
      setError(err.response?.data?.error || 'Failed to bulk promote chats');
    } finally {
      setPromoting(false);
    }
  };

  const refreshAdminStatus = async () => {
    try {
      setError(null);
      await api.post('/api/discovery/refresh');
      setSuccess('Admin statuses refreshed successfully!');
      await fetchDiscoveredChats();
    } catch (err: any) {
      console.error('Error refreshing admin status:', err);
      setError(err.response?.data?.error || 'Failed to refresh admin statuses');
    }
  };

  const toggleChatSelection = (chatId: string) => {
    setSelectedChats(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredChats.map(c => c.chat_id);
    setSelectedChats(prev => {
      const newSelection = [...new Set([...prev, ...filteredIds])];
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedChats([]);
  };

  const filteredChats = discoveredChats.filter(chat => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      (chat.chat_title || '').toLowerCase().includes(query) ||
      (chat.chat_username || '').toLowerCase().includes(query) ||
      chat.chat_id.toLowerCase().includes(query);
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'admin' && chat.is_admin) ||
      (filterStatus === 'member' && !chat.is_admin) ||
      (filterStatus === 'promoted' && chat.is_promoted);
    
    const matchesType = filterType === 'all' || chat.chat_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  useEffect(() => {
    fetchDiscoveredChats();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <RouteGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Chat Discovery
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Discover and manage all chats where the bot is a member.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshAdminStatus}
                className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                <ShieldCheckIcon className="w-4 h-4 mr-2"/>
                Refresh Status
              </button>
              <button
                onClick={triggerDiscovery}
                disabled={scanning}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <MagnifyingGlassIcon className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`}/>
                {scanning ? 'Scanning...' : 'Scan Chats'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Chats</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.admin}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Admin Access</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.promoted}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Monitoring</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.channels}</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Channels</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.groups}</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Groups</div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                  <input 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, username, or ID..."
                    className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white w-full sm:w-auto"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4 text-gray-400"/>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="admin">Admin Only</option>
                    <option value="member">Member Only</option>
                    <option value="promoted">Promoted</option>
                  </select>
                  
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="channel">Channels</option>
                    <option value="group">Groups</option>
                    <option value="supergroup">Supergroups</option>
                  </select>
                </div>
              </div>

              {/* Selection Actions */}
              {selectedChats.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedChats.length} selected
                  </span>
                  <button
                    onClick={bulkPromoteChats}
                    disabled={promoting}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4 mr-1"/>
                    {promoting ? 'Promoting...' : 'Promote Selected'}
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            {/* Bulk Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredChats.length} of {discoveredChats.length} chats
              </div>
              <button
                onClick={selectAllFiltered}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Select All Visible
              </button>
            </div>
          </div>

          {/* Discovered Chats List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading discovered chats...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-8 text-center">
                {discoveredChats.length === 0 ? (
                  <div>
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No chats discovered yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Run a discovery scan to find all chats where the bot is a member.
                    </p>
                    <button
                      onClick={triggerDiscovery}
                      disabled={scanning}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <MagnifyingGlassIcon className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`}/>
                      {scanning ? 'Scanning...' : 'Start Discovery'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <FunnelIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching chats</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No chats match your current search and filter criteria.
                    </p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('all');
                        setFilterType('all');
                      }} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedChats.length === filteredChats.length && filteredChats.length > 0}
                          onChange={() => {
                            if (selectedChats.length === filteredChats.length) {
                              clearSelection();
                            } else {
                              selectAllFiltered();
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Chat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Access Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Discovered
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredChats.map((chat) => (
                      <tr key={chat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedChats.includes(chat.chat_id)}
                            onChange={() => toggleChatSelection(chat.chat_id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {chat.chat_type === 'channel' ? (
                              <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400 mr-2" />
                            ) : (
                              <UserGroupIcon className="w-5 h-5 text-gray-400 mr-2" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {chat.chat_title || 'Unnamed Chat'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {chat.chat_username ? `@${chat.chat_username}` : chat.chat_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {chat.chat_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            chat.is_admin 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {chat.is_admin ? (
                              <>
                                <ShieldCheckIcon className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <UsersIcon className="w-3 h-3 mr-1" />
                                Member
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {chat.is_promoted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              <EyeIcon className="w-3 h-3 mr-1" />
                              Monitoring
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not monitored
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(chat.last_discovered).toLocaleDateString()}
                          {chat.discovery_method && (
                            <div className="text-xs text-gray-400">
                              via {chat.discovery_method}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!chat.is_promoted && (
                            <button
                              onClick={() => promoteChat(chat.chat_id)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                            >
                              <PlusIcon className="w-3 h-3 mr-1" />
                              Promote
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </RouteGuard>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fa', ['common'])),
  },
});