import { useState, useEffect } from 'react';
import RouteGuard from '../components/auth/RouteGuard';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import api from '../lib/api';
import { 
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface MessageFeed {
  id: string;
  user_id: string;
  queue_id: string;
  title: string;
  content: string;
  data?: any;
  created_at: string;
}

interface QueuedMessage {
  id: string;
  user_id: string;
  channel_id: string;
  original_chat_id: string;
  message_text: string;
  message_type: string;
  matched_keywords?: any;
  message_data?: any;
  status: 'pending' | 'delivered' | 'failed';
  created_at: string;
  delivered_at?: string;
  failure_reason?: string;
}

export default function MessageFeedPage() {
  const { t } = useTranslation('common');
  const [feedItems, setFeedItems] = useState<MessageFeed[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'queue'>('feed');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchFeed = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true); else setLoading(true);
      setError(null);
      
      // Fetch message feed
      const feedResponse = await api.get('/api/messages/feed');
      setFeedItems(feedResponse.data || []);
      
      // Fetch message queue
      const queueResponse = await api.get('/api/messages/queue');
      setQueuedMessages(queueResponse.data || []);
      
    } catch (err: any) {
      console.error('Error fetching feed:', err);
      setError(err.response?.data?.error || 'Failed to load message feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const clearFeed = async () => {
    if (!confirm('Clear all feed items?')) return;
    try {
      await api.delete('/api/messages/feed');
      setSuccess('Message feed cleared successfully');
      await fetchFeed();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clear feed');
    }
  };

  const retryMessage = async (messageId: string) => {
    try {
      await api.post(`/api/messages/retry/${messageId}`);
      setSuccess('Message retry triggered');
      await fetchFeed();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to retry message');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchFeed();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchFeed(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
                Live Message Feed
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Real-time view of all matched and queued messages from monitored channels.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                Auto-refresh
              </label>
              <button
                onClick={() => fetchFeed(true)}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>
                Refresh
              </button>
              <button
                onClick={clearFeed}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <TrashIcon className="w-4 h-4 mr-2"/>
                Clear Feed
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'feed'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-2"/>
                  Live Feed ({feedItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'queue'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <ClockIcon className="w-4 h-4 inline mr-2"/>
                  Message Queue ({queuedMessages.length})
                </button>
              </nav>
            </div>

            {/* Alerts */}
            {error && (
              <div className="m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="m-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {success}
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading messages...</p>
              </div>
            ) : (
              <div className="min-h-[400px]">
                {/* Live Feed Tab */}
                {activeTab === 'feed' && (
                  <div className="p-6">
                    {feedItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Messages matching your keywords will appear here in real-time.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {feedItems.map((item) => (
                          <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.title}
                                  </h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(item.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  {item.content}
                                </p>
                                {item.data && (
                                  <details className="text-xs text-gray-500 dark:text-gray-400">
                                    <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                                      View raw data
                                    </summary>
                                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                                      {JSON.stringify(item.data, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Queue Tab */}
                {activeTab === 'queue' && (
                  <div className="p-6">
                    {queuedMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No queued messages</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Messages are queued here before being delivered via multiple channels.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {queuedMessages.map((msg) => (
                          <div key={msg.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    getStatusColor(msg.status)
                                  }`}>
                                    {msg.status === 'delivered' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                                    {msg.status === 'failed' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                                    {msg.status === 'pending' && <ClockIcon className="w-3 h-3 mr-1" />}
                                    {msg.status}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {msg.message_type}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(msg.created_at)}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  <strong>From:</strong> {msg.original_chat_id}
                                </p>
                                
                                <div className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border">
                                  {msg.message_text || '[No text content]'}
                                </div>
                                
                                {msg.matched_keywords && (
                                  <div className="mt-2">
                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                      Matched keywords: {JSON.stringify(msg.matched_keywords)}
                                    </span>
                                  </div>
                                )}
                                
                                {msg.delivered_at && (
                                  <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                                    Delivered: {formatDate(msg.delivered_at)}
                                  </div>
                                )}
                                
                                {msg.failure_reason && (
                                  <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    Failure: {msg.failure_reason}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {msg.status === 'failed' && (
                                  <button
                                    onClick={() => retryMessage(msg.id)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    title="Retry delivery"
                                  >
                                    <ArrowPathIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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