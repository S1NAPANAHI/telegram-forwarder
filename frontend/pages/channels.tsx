import { useEffect, useMemo, useState } from 'react';
import RouteGuard from '../components/auth/RouteGuard';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import api from '../lib/api';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Channel {
  id: string;
  platform: 'telegram' | 'eitaa' | 'website';
  channel_url: string;
  channel_name?: string | null;
  platform_specific_id?: string | null;
  admin_status?: boolean | null;
  monitoring_method?: string | null;
  is_active: boolean;
  discovery_source?: string | null;
  last_checked?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ChannelForm {
  platform: 'telegram' | 'eitaa' | 'website';
  channel_url: string;
  channel_name?: string;
  is_active: boolean;
}

interface MonitoringStats {
  totalActiveChannels: number;
  methodBreakdown: {
    bot_api: number;
    client_api: number;
    pull: number;
    [key: string]: number;
  };
  services: {
    [key: string]: string;
  };
}

const defaultForm: ChannelForm = {
  platform: 'telegram',
  channel_url: '',
  channel_name: '',
  is_active: true
};

export default function ChannelsPage() {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Channel | null>(null);
  const [form, setForm] = useState<ChannelForm>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'telegram' | 'eitaa' | 'website'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  const filtered = useMemo(() => {
    return items.filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = q.length === 0 ||
        (c.channel_name || '').toLowerCase().includes(q) ||
        (c.channel_url || '').toLowerCase().includes(q) ||
        (c.platform_specific_id || '').toLowerCase().includes(q);
      const matchesActive = filterActive === 'all' ||
        (filterActive === 'active' && c.is_active) ||
        (filterActive === 'inactive' && !c.is_active);
      const matchesPlatform = filterPlatform === 'all' || c.platform === filterPlatform;
      return matchesQuery && matchesActive && matchesPlatform;
    });
  }, [items, query, filterActive, filterPlatform]);

  const fetchChannels = async (showRefreshing = false) => {
    try {
      setError(null);
      if (showRefreshing) setRefreshing(true); else setLoading(true);
      const res = await api.get('/api/channels');
      setItems(res.data || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load channels');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMonitoringStats = async () => {
    try {
      const res = await api.get('/api/monitoring/status');
      setMonitoringStats(res.data || null);
    } catch (e: any) {
      console.warn('Could not fetch monitoring stats:', e.message);
    }
  };

  useEffect(() => { 
    fetchChannels();
    fetchMonitoringStats();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (c: Channel) => {
    setEditing(c);
    setForm({
      platform: c.platform,
      channel_url: c.channel_url,
      channel_name: c.channel_name || '',
      is_active: c.is_active
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!form.channel_url.trim()) return setError('Channel URL/ID is required');

      if (editing) {
        await api.put(`/api/channels/${editing.id}`, form);
        setSuccess('Channel updated successfully');
      } else {
        await api.post('/api/channels', form);
        setSuccess('Channel created successfully');
      }
      setModalOpen(false);
      await fetchChannels();
      await fetchMonitoringStats();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save channel');
    }
  };

  const toggleActive = async (c: Channel) => {
    try {
      await api.put(`/api/channels/${c.id}`, { is_active: !c.is_active });
      setSuccess(`Channel ${!c.is_active ? 'activated' : 'deactivated'} successfully`);
      await fetchChannels();
      await fetchMonitoringStats();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update channel');
    }
  };

  const remove = async (c: Channel) => {
    if (!confirm(`Delete channel "${c.channel_name || c.channel_url}"?`)) return;
    try {
      await api.delete(`/api/channels/${c.id}`);
      setSuccess('Channel deleted successfully');
      await fetchChannels();
      await fetchMonitoringStats();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to delete channel');
    }
  };

  const refreshMonitoring = async () => {
    try {
      setRefreshing(true);
      // Trigger monitoring refresh if available
      await api.post('/api/monitoring/refresh').catch(() => {});
      await fetchChannels();
      await fetchMonitoringStats();
      setSuccess('Monitoring status refreshed');
    } catch (e: any) {
      setError('Failed to refresh monitoring');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeColor = (method?: string | null, isActive?: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    switch (method) {
      case 'bot_api':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'client_api':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pull':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(null); setSuccess(null); }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  return (
    <RouteGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Channel & Group Manager</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage monitored channels, check status, and configure forwarding settings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {monitoringStats && (
                <button 
                  onClick={() => setShowStats(!showStats)} 
                  className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2"/>
                  Stats ({monitoringStats.totalActiveChannels})
                </button>
              )}
              <button 
                onClick={refreshMonitoring} 
                disabled={refreshing} 
                className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>
                Refresh
              </button>
              <button onClick={openAdd} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2"/> Add Channel
              </button>
            </div>
          </div>

          {/* Monitoring Stats */}
          {showStats && monitoringStats && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monitoring Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {monitoringStats.methodBreakdown.bot_api || 0}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Bot API (Admin)</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {monitoringStats.methodBreakdown.client_api || 0}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Client API (User)</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {monitoringStats.methodBreakdown.pull || 0}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Pull Monitoring</div>
                </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input 
                  value={query} 
                  onChange={e=>setQuery(e.target.value)} 
                  placeholder="Search channels, URLs, or IDs..." 
                  className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400"/>
                <select 
                  value={filterActive} 
                  onChange={e=>setFilterActive(e.target.value as any)} 
                  className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select 
                  value={filterPlatform} 
                  onChange={e=>setFilterPlatform(e.target.value as any)} 
                  className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Platforms</option>
                  <option value="telegram">Telegram</option>
                  <option value="eitaa">Eitaa</option>
                  <option value="website">Website</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filtered.length} of {items.length} channels
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading channels...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                {query || filterActive !== 'all' || filterPlatform !== 'all' ? (
                  <div>
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching channels</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No channels match your current filters.</p>
                    <button onClick={() => { setQuery(''); setFilterActive('all'); setFilterPlatform('all'); }} className="text-blue-600 hover:text-blue-800">
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <PlusIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No channels yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first channel to start monitoring messages.</p>
                    <button onClick={openAdd} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add First Channel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monitoring</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Check</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {c.channel_name || 'Unnamed Channel'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {c.channel_url}
                          </div>
                          {c.platform_specific_id && c.platform_specific_id !== c.channel_url && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                              ID: {c.platform_specific_id}
                            </div>
                          )}
                          {c.discovery_source && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              🔍 {c.discovery_source}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {c.platform}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(c.monitoring_method, c.is_active)}`}>
                            {c.is_active ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                {c.monitoring_method || 'active'}
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-3 h-3 mr-1" />
                                inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {c.admin_status !== null ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.admin_status 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {c.admin_status ? 'Admin' : 'Member'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Unknown</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                          {c.last_checked ? formatDate(c.last_checked) : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => toggleActive(c)} 
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" 
                              title={c.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <EyeIcon className="w-5 h-5"/>
                            </button>
                            <button 
                              onClick={() => openEdit(c)} 
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300" 
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5"/>
                            </button>
                            <button 
                              onClick={() => remove(c)} 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" 
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
              <form onSubmit={save}>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{editing ? 'Edit Channel' : 'Add Channel'}</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                      <select 
                        value={form.platform} 
                        onChange={e=>setForm({...form, platform: e.target.value as any})} 
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="telegram">Telegram</option>
                        <option value="eitaa">Eitaa</option>
                        <option value="website">Website</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                      <input 
                        value={form.channel_name || ''} 
                        onChange={e=>setForm({...form, channel_name: e.target.value})} 
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Optional display name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Channel URL/ID *
                      <span className="text-xs text-gray-500 ml-2">(@username, t.me/channel, or numeric ID)</span>
                    </label>
                    <input 
                      value={form.channel_url} 
                      onChange={e=>setForm({...form, channel_url: e.target.value})} 
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono" 
                      required 
                      placeholder="@channel_name, https://t.me/channel_name, or -123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 For Telegram: Use @username or t.me links for easy setup
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input 
                        type="checkbox" 
                        checked={form.is_active} 
                        onChange={e=>setForm({...form, is_active: e.target.checked})} 
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      Active (start monitoring immediately)
                    </label>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-3 rounded-b-lg">
                  <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-200">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fa', ['common'])),
  },
});