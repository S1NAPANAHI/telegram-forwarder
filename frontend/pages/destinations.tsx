import { useState, useEffect } from 'react';
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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface Destination {
  id: string;
  name: string;
  type: string;
  platform: string;
  chat_id: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DestinationFormData {
  name: string;
  type: string;
  platform: string;
  chat_id: string;
  description?: string;
  is_active: boolean;
}

function Destinations() {
  const { t } = useTranslation('common');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [formData, setFormData] = useState<DestinationFormData>({
    name: '',
    type: 'private_chat',
    platform: 'telegram',
    chat_id: '',
    description: '',
    is_active: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchDestinations = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true); else setLoading(true);
      setError(null);
      const response = await api.get('/api/destinations');
      setDestinations(response.data || []);
    } catch (err: any) {
      console.error('Error fetching destinations:', err);
      setError(err.response?.data?.error || 'Failed to load destinations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'private_chat',
      platform: 'telegram',
      chat_id: '',
      description: '',
      is_active: true
    });
    setEditingDestination(null);
    setError(null);
    setSuccess(null);
  };

  const openModal = (destination?: Destination) => {
    resetForm();
    if (destination) {
      setEditingDestination(destination);
      setFormData({
        name: destination.name,
        type: destination.type || 'private_chat',
        platform: destination.platform || 'telegram',
        chat_id: destination.chat_id,
        description: destination.description || '',
        is_active: destination.is_active
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.chat_id.trim()) {
      setError('Name and Chat ID are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingDestination) {
        // Update existing destination
        await api.put(`/api/destinations/${editingDestination.id}`, formData);
        setSuccess('Destination updated successfully!');
      } else {
        // Create new destination
        await api.post('/api/destinations', formData);
        setSuccess('Destination created successfully!');
      }

      await fetchDestinations();
      closeModal();
    } catch (err: any) {
      console.error('Error saving destination:', err);
      setError(err.response?.data?.error || 'Failed to save destination');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (destinationId: string) => {
    try {
      setError(null);
      await api.delete(`/api/destinations/${destinationId}`);
      setSuccess('Destination deleted successfully!');
      await fetchDestinations();
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting destination:', err);
      setError(err.response?.data?.error || 'Failed to delete destination');
    }
  };

  const toggleStatus = async (destination: Destination) => {
    try {
      setError(null);
      await api.put(`/api/destinations/${destination.id}`, {
        is_active: !destination.is_active
      });
      setSuccess(`Destination ${!destination.is_active ? 'activated' : 'deactivated'} successfully!`);
      await fetchDestinations();
    } catch (err: any) {
      console.error('Error toggling destination status:', err);
      setError(err.response?.data?.error || 'Failed to update destination status');
    }
  };

  // ENHANCED: Manual @username resolution
  const resolveUsername = async (destination: Destination) => {
    if (!destination.chat_id.startsWith('@')) {
      setError('Only @username destinations can be resolved');
      return;
    }

    try {
      setResolving(destination.id);
      setError(null);
      const response = await api.post(`/api/destinations/${destination.id}/resolve`);
      
      if (response.data.updated) {
        setSuccess(`✅ Resolved ${response.data.original} → ${response.data.resolved}`);
        await fetchDestinations();
      } else {
        setSuccess('Chat ID is already numeric - no resolution needed');
      }
    } catch (err: any) {
      console.error('Error resolving username:', err);
      setError(err.response?.data?.error || 'Failed to resolve username');
    } finally {
      setResolving(null);
    }
  };

  // Filter destinations based on search query
  const filteredDestinations = destinations.filter(dest => {
    const query = searchQuery.toLowerCase();
    return (
      dest.name.toLowerCase().includes(query) ||
      dest.chat_id.toLowerCase().includes(query) ||
      (dest.description || '').toLowerCase().includes(query)
    );
  });

  // Auto-clear success/error messages
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
                Destination Manager
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage destination channels and users where messages will be forwarded.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDestinations(true)}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>
                Refresh
              </button>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Destination
              </button>
            </div>
          </div>

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

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
              <input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, chat ID, or description..."
                className="pl-9 pr-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Destinations List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading destinations...</p>
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div className="p-8 text-center">
                {searchQuery ? (
                  <div>
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching destinations</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No destinations match your search criteria.</p>
                    <button onClick={() => setSearchQuery('')} className="text-blue-600 hover:text-blue-800">Clear search</button>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlusIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No destinations yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Add your first destination channel to start forwarding messages.
                    </p>
                    <button
                      onClick={() => openModal()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add First Destination
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Chat ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDestinations.map((destination) => (
                      <tr key={destination.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {destination.name}
                            </div>
                            {destination.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {destination.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 dark:text-white font-mono">
                              {destination.chat_id}
                            </span>
                            {destination.chat_id.startsWith('@') && (
                              <button
                                onClick={() => resolveUsername(destination)}
                                disabled={resolving === destination.id}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Resolve @username to numeric ID"
                              >
                                {resolving === destination.id ? (
                                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <LinkIcon className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                          {destination.platform} • {destination.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleStatus(destination)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              destination.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                            }`}
                          >
                            {destination.is_active ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(destination.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openModal(destination)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(destination.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
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

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingDestination ? 'Edit Destination' : 'Add New Destination'}
                  </h3>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Destination name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Platform
                      </label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="telegram">Telegram</option>
                        <option value="eitaa">Eitaa</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="private_chat">Private Chat</option>
                        <option value="channel">Channel</option>
                        <option value="group">Group</option>
                        <option value="supergroup">Supergroup</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Chat ID * 
                      <span className="text-xs text-gray-500">(@username or numeric ID)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.chat_id}
                      onChange={(e) => setFormData({ ...formData, chat_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                      placeholder="@channel_username or -123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Use @username for easy setup - it will be automatically resolved to numeric ID
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Optional description..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active (messages will be forwarded to this destination)
                    </label>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3 rounded-b-lg">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Saving...' : (editingDestination ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this destination? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}

export default Destinations;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fa', ['common'])),
  },
});