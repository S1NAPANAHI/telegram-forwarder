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

interface Keyword {
  id: string;
  keyword: string;
  description?: string | null;
  match_mode: 'exact' | 'contains' | 'regex';
  case_sensitive: boolean;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface KeywordForm {
  keyword: string;
  description?: string;
  match_mode: 'exact' | 'contains' | 'regex';
  case_sensitive: boolean;
  priority: number;
  is_active: boolean;
}

const defaultForm: KeywordForm = {
  keyword: '',
  description: '',
  match_mode: 'contains',
  case_sensitive: false,
  priority: 0,
  is_active: true
};

export default function KeywordsPage() {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Keyword | null>(null);
  const [form, setForm] = useState<KeywordForm>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return items.filter(k => {
      const matchesQuery = query.trim().length === 0 ||
        k.keyword.toLowerCase().includes(query.toLowerCase()) ||
        (k.description || '').toLowerCase().includes(query.toLowerCase());
      const matchesActive = filterActive === 'all' ||
        (filterActive === 'active' && k.is_active) ||
        (filterActive === 'inactive' && !k.is_active);
      return matchesQuery && matchesActive;
    });
  }, [items, query, filterActive]);

  const fetchKeywords = async (showRefreshing = false) => {
    try {
      setError(null);
      if (showRefreshing) setRefreshing(true); else setLoading(true);
      const res = await api.get('/api/keywords');
      setItems(res.data || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load keywords');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchKeywords(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (k: Keyword) => {
    setEditing(k);
    setForm({
      keyword: k.keyword,
      description: k.description || '',
      match_mode: k.match_mode,
      case_sensitive: k.case_sensitive,
      priority: k.priority,
      is_active: k.is_active
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!form.keyword.trim()) return setError('Keyword is required');

      if (editing) {
        await api.put(`/api/keywords/${editing.id}`, form);
        setSuccess('Keyword updated');
      } else {
        await api.post('/api/keywords', form);
        setSuccess('Keyword created');
      }
      setModalOpen(false);
      await fetchKeywords();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save keyword');
    }
  };

  const toggleActive = async (k: Keyword) => {
    try {
      await api.put(`/api/keywords/${k.id}`, { is_active: !k.is_active });
      setSuccess(`Keyword ${!k.is_active ? 'activated' : 'deactivated'}`);
      await fetchKeywords();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update keyword');
    }
  };

  const remove = async (k: Keyword) => {
    if (!confirm('Delete this keyword?')) return;
    try {
      await api.delete(`/api/keywords/${k.id}`);
      setSuccess('Keyword deleted');
      await fetchKeywords();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to delete keyword');
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Keyword Manager</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Define rules for matching and forwarding.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchKeywords(true)} disabled={refreshing} className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50">
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>
                Refresh
              </button>
              <button onClick={openAdd} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2"/> Add Keyword
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
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search keywords..." className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
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
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading keywords...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No keywords yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keyword</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Case</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map(k => (
                      <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{k.keyword}</div>
                          {k.description && <div className="text-sm text-gray-500 dark:text-gray-400">{k.description}</div>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{k.match_mode}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{k.case_sensitive ? 'Sensitive' : 'Insensitive'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{k.priority}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleActive(k)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${k.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                            {k.is_active ? <CheckCircleIcon className="w-3 h-3 mr-1"/> : <XCircleIcon className="w-3 h-3 mr-1"/>}
                            {k.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openEdit(k)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => remove(k)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete"><TrashIcon className="w-5 h-5"/></button>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-xl">
              <form onSubmit={save}>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{editing ? 'Edit Keyword' : 'Add Keyword'}</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keyword *</label>
                    <input value={form.keyword} onChange={e=>setForm({...form, keyword:e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Match Mode</label>
                      <select value={form.match_mode} onChange={e=>setForm({...form, match_mode:e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <option value="exact">Exact</option>
                        <option value="contains">Contains</option>
                        <option value="regex">Regex</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-6 sm:mt-0">
                      <input id="case" type="checkbox" checked={form.case_sensitive} onChange={e=>setForm({...form, case_sensitive:e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                      <label htmlFor="case" className="text-sm text-gray-700 dark:text-gray-300">Case Sensitive</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                      <input type="number" value={form.priority} onChange={e=>setForm({...form, priority:Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="active" type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active:e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                    <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
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
