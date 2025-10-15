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
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Channel {
  id: string;
  platform: 'telegram' | 'eitaa' | 'website';
  chat_type: 'channel' | 'group' | 'supergroup' | 'private';
  chat_id: string;
  channel_name?: string | null;
  username?: string | null;
  description?: string | null;
  is_active: boolean;
  forward_enabled: boolean;
  allow_media: boolean;
  allow_links: boolean;
  priority: number;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface ChannelForm {
  platform: 'telegram' | 'eitaa' | 'website';
  chat_type: 'channel' | 'group' | 'supergroup' | 'private';
  chat_id: string;
  channel_name?: string;
  username?: string;
  description?: string;
  is_active: boolean;
  forward_enabled: boolean;
  allow_media: boolean;
  allow_links: boolean;
  priority: number;
}

const defaultForm: ChannelForm = {
  platform: 'telegram',
  chat_type: 'channel',
  chat_id: '',
  channel_name: '',
  username: '',
  description: '',
  is_active: true,
  forward_enabled: true,
  allow_media: true,
  allow_links: true,
  priority: 0
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
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return items.filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = q.length === 0 ||
        (c.channel_name || '').toLowerCase().includes(q) ||
        (c.username || '').toLowerCase().includes(q) ||
        c.chat_id.toLowerCase().includes(q);
      const matchesActive = filterActive === 'all' ||
        (filterActive === 'active' && c.is_active) ||
        (filterActive === 'inactive' && !c.is_active);
      return matchesQuery && matchesActive;
    });
  }, [items, query, filterActive]);

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

  useEffect(() => { fetchChannels(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (c: Channel) => {
    setEditing(c);
    setForm({
      platform: c.platform,
      chat_type: c.chat_type,
      chat_id: c.chat_id,
      channel_name: c.channel_name || '',
      username: c.username || '',
      description: c.description || '',
      is_active: c.is_active,
      forward_enabled: c.forward_enabled,
      allow_media: c.allow_media,
      allow_links: c.allow_links,
      priority: c.priority
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!form.chat_id.trim()) return setError('chat_id is required');

      if (editing) {
        await api.put(`/api/channels/${editing.id}`, form);
        setSuccess('Channel updated');
      } else {
        await api.post('/api/channels', form);
        setSuccess('Channel created');
      }
      setModalOpen(false);
      await fetchChannels();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save channel');
    }
  };

  const toggleActive = async (c: Channel) => {
    try {
      await api.put(`/api/channels/${c.id}`, { is_active: !c.is_active });
      setSuccess(`Channel ${!c.is_active ? 'activated' : 'deactivated'}`);
      await fetchChannels();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update channel');
    }
  };

  const toggleForward = async (c: Channel) => {
    try {
      await api.put(`/api/channels/${c.id}`, { forward_enabled: !c.forward_enabled });
      setSuccess(`Forwarding ${!c.forward_enabled ? 'enabled' : 'disabled'}`);
      await fetchChannels();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update forwarding');
    }
  };

  const remove = async (c: Channel) => {
    if (!confirm('Delete this channel?')) return;
    try {
      await api.delete(`/api/channels/${c.id}`);
      setSuccess('Channel deleted');
      await fetchChannels();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to delete channel');
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
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage all chats the bot is in, toggle forwarding and settings.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchChannels(true)} disabled={refreshing} className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50">
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>
                Refresh
              </button>
              <button onClick={openAdd} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2"/> Add Chat
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">{success}</div>
          )}

          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, @username, or chat id..." className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400"/>
                <select value={filterActive} onChange={e=>setFilterActive(e.target.value as any)} className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading chats...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No chats yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Forwarding</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{c.channel_name || '(no name)'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{c.chat_id} {c.username ? `• @${c.username}` : ''}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{c.platform} • {c.chat_type}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleForward(c)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.forward_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                            {c.forward_enabled ? <CheckCircleIcon className="w-3 h-3 mr-1"/> : <XCircleIcon className="w-3 h-3 mr-1"/>}
                            {c.forward_enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleActive(c)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                            {c.is_active ? <CheckCircleIcon className="w-3 h-3 mr-1"/> : <XCircleIcon className="w-3 h-3 mr-1"/>}
                            {c.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{c.priority}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => remove(c)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete"><TrashIcon className="w-5 h-5"/></button>
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{editing ? 'Edit Chat' : 'Add Chat'}</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                      <select value={form.platform} onChange={e=>setForm({...form, platform: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <option value="telegram">Telegram</option>
                        <option value="eitaa">Eitaa</option>
                        <option value="website">Website</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chat Type</label>
                      <select value={form.chat_type} onChange={e=>setForm({...form, chat_type: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <option value="channel">Channel</option>
                        <option value="group">Group</option>
                        <option value="supergroup">Supergroup</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chat ID *</label>
                      <input value={form.chat_id} onChange={e=>setForm({...form, chat_id: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono" required placeholder="-100123456789 or @username"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                      <input value={form.channel_name} onChange={e=>setForm({...form, channel_name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">@Username</label>
                      <input value={form.username} onChange={e=>setForm({...form, username: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                      <input type="number" value={form.priority} onChange={e=>setForm({...form, priority: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                      Active
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={form.forward_enabled} onChange={e=>setForm({...form, forward_enabled: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                      Forwarding
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={form.allow_media} onChange={e=>setForm({...form, allow_media: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                      Allow Media
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={form.allow_links} onChange={e=>setForm({...form, allow_links: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                      Allow Links
                    </label>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-3 rounded-b-lg">
                  <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-200">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
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
