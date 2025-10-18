import RouteGuard from '../components/auth/RouteGuard';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface LogItem {
  _id: string;
  message: string;
  channel?: string;
  keyword?: string;
  status: 'pending' | 'forwarded' | 'failed';
  error?: string | null;
  timestamp: string;
}

export default function LogsPage() {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'forwarded' | 'failed'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async (reset = false) => {
    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      const res = await api.get('/api/logs', {
        params: { page: reset ? 1 : page, perPage: 20, status: status === 'all' ? undefined : status, q: query || undefined }
      });
      const raw = res.data;
      const list: LogItem[] = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : Array.isArray(raw?.data) ? raw.data : [];
      setItems(prev => reset ? list : [...prev, ...list]);
      setHasMore((raw?.hasMore ?? (list.length === 20)) && list.length > 0);
      setPage(p => reset ? 2 : p + 1);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLogs(true); }, [status]);

  const applySearch = () => fetchLogs(true);
  const refresh = async () => { setRefreshing(true); await fetchLogs(true); };

  const filteredCount = items.length;

  return (
    <RouteGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('logs')}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('viewSystemLogs') || 'Forwarding events, errors, and system activity.'}</p>
            </div>
            <button onClick={refresh} disabled={refreshing} className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50">
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>
              Refresh
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input 
                  value={query} 
                  onChange={e=>setQuery(e.target.value)} 
                  placeholder="Search messages, channels, keywords..." 
                  className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button onClick={applySearch} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400"/>
              <select 
                value={status} 
                onChange={e=>setStatus(e.target.value as any)} 
                className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All</option>
                <option value="forwarded">Forwarded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {loading && items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading logs...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No logs yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Logs will appear here once messages are processed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keyword</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Error</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xl truncate" title={log.message}>
                          {log.message}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                          {log.channel || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                          {log.keyword || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.status === 'forwarded' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            log.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-red-600 dark:text-red-400 max-w-xs truncate" title={log.error || ''}>
                          {log.error || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {hasMore && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                <button onClick={() => fetchLogs(false)} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50">
                  Load more
                </button>
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